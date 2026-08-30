import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { products } from "@/lib/products";
import { sourceCostsBySku } from "@/lib/internal-pricing.server";
import { variantSku } from "./validation";
import type { CheckoutDetails, CheckoutItem, CreatedOrder, OrderReceipt, PaymentMethod } from "./types";

const url=process.env.SUPABASE_URL?.replace(/\/$/,"");
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const allowLocal=process.env.NODE_ENV!=="production"||process.env.DEALSTORE_DEV_COMMERCE==="true";
const localOrders=new Map<string,OrderReceipt & {tokenHash:string;idempotencyKey:string}>();
const byKey=new Map<string,CreatedOrder>();

async function supabase<T>(path:string,init:RequestInit={}):Promise<T>{
  if(!url||!key)throw new Error("COMMERCE_NOT_CONFIGURED");
  const response=await fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",...(init.headers||{})},cache:"no-store"});
  if(!response.ok)throw new Error(`SUPABASE_${response.status}:${await response.text()}`);
  return response.status===204?undefined as T:response.json();
}
export const commerceConfigured=()=>Boolean(url&&key);

export async function createOrder(checkout:CheckoutDetails,items:CheckoutItem[],paymentMethod:PaymentMethod,idempotencyKey:string):Promise<CreatedOrder>{
  if(commerceConfigured())return supabase<CreatedOrder>("rpc/create_order",{method:"POST",body:JSON.stringify({p_checkout:checkout,p_items:items,p_payment_method:paymentMethod,p_idempotency_key:idempotencyKey})});
  if(!allowLocal)throw new Error("COMMERCE_NOT_CONFIGURED");
  const duplicate=byKey.get(idempotencyKey); if(duplicate)return {...duplicate,access_token:null,duplicate:true};
  let total=0; const snapshots:OrderReceipt["order_items"]=[];
  for(const item of items){
    const product=products.find(candidate=>candidate.sizes.some(size=>variantSku(candidate.id,size)===item.sku));
    const size=product?.sizes.find(value=>variantSku(product.id,value)===item.sku);
    if(!product||!size)throw new Error("VARIANT_UNAVAILABLE");
    const unitPrice=sourceCostsBySku[product.id]+200; total+=unitPrice*item.quantity;
    snapshots.push({product_name:product.name,sku:item.sku,size,colour:product.colour,unit_price:unitPrice,quantity:item.quantity,line_total:unitPrice*item.quantity,image_url:product.images[0]});
  }
  const token=randomBytes(24).toString("hex"); const order_number=`DS-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const result={order_number,access_token:token,duplicate:false,total};
  localOrders.set(order_number,{order_number,customer_name:checkout.full_name,phone:checkout.phone,email:checkout.email||null,shipping_address:checkout,total_amount:total,payment_method:paymentMethod,payment_status:paymentMethod==="cod"?"unpaid":"pending",order_status:paymentMethod==="cod"?"confirmed":"pending",created_at:new Date().toISOString(),order_items:snapshots,tokenHash:createHash("sha256").update(token).digest("hex"),idempotencyKey});
  byKey.set(idempotencyKey,result); return result;
}
export async function getOrder(orderNumber:string,token:string):Promise<OrderReceipt|null>{
  const hash=createHash("sha256").update(token).digest("hex");
  if(commerceConfigured()){
    const rows=await supabase<OrderReceipt[]>(`orders?order_number=eq.${encodeURIComponent(orderNumber)}&access_token_hash=eq.${hash}&select=order_number,customer_name,phone,email,shipping_address,total_amount,payment_method,payment_status,order_status,created_at,order_items(product_name,sku,size,colour,unit_price,quantity,line_total,image_url)`);
    return rows[0]||null;
  }
  if(!allowLocal)return null; const order=localOrders.get(orderNumber); return order?.tokenHash===hash?order:null;
}
export async function attachStripeSession(orderNumber:string,sessionId:string,paymentIntentId?:string){
  if(commerceConfigured())await supabase(`orders?order_number=eq.${encodeURIComponent(orderNumber)}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({stripe_checkout_session_id:sessionId,stripe_payment_intent_id:paymentIntentId||null})});
}
export async function applyStripeEvent(eventId:string,eventType:string,sessionId:string,paymentIntentId:string){
  if(commerceConfigured())return supabase<boolean>("rpc/apply_stripe_event",{method:"POST",body:JSON.stringify({p_event_id:eventId,p_event_type:eventType,p_session_id:sessionId,p_payment_intent_id:paymentIntentId})});
  return false;
}
