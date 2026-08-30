import "server-only";
import type { CheckoutDetails, CheckoutItem, CreatedOrder } from "./types";
export { verifyStripeSignature } from "./stripe-signature";

export const stripeConfigured=()=>Boolean(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET);
export async function createStripeCheckout(order:CreatedOrder,checkout:CheckoutDetails,items:CheckoutItem[]){
  void items;
  const secret=process.env.STRIPE_SECRET_KEY; if(!secret)throw new Error("STRIPE_NOT_CONFIGURED");
  const origin=process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/,""); if(!origin)throw new Error("SITE_URL_NOT_CONFIGURED");
  const form=new URLSearchParams({mode:"payment",success_url:`${origin}/order-success?order=${encodeURIComponent(order.order_number)}`,cancel_url:`${origin}/checkout?payment=cancelled`,"metadata[order_number]":order.order_number,"customer_email":checkout.email||""});
  form.set("line_items[0][quantity]","1");form.set("line_items[0][price_data][currency]","inr");form.set("line_items[0][price_data][unit_amount]",String(order.total*100));form.set("line_items[0][price_data][product_data][name]",`Dealstore order ${order.order_number}`);
  const response=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${secret}`,"Content-Type":"application/x-www-form-urlencoded"},body:form});
  if(!response.ok)throw new Error(`STRIPE_${response.status}`); return response.json() as Promise<{id:string;url:string;payment_intent?:string}>;
}
