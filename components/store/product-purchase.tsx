"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { useCart } from "./cart-provider";

export function ProductPurchase({ product }: { product: Product }) {
  const [size,setSize]=useState(""); const [message,setMessage]=useState(""); const {addItem}=useCart(); const router=useRouter();
  const available = product.variants?.some(variant=>variant.available) ?? product.sizes.length>0;
  const commit=(buy=false)=>{if(!size){setMessage("Choose an available size to continue.");return}addItem(product,size);setMessage("Added to your bag.");if(buy)router.push("/checkout")};
  return <div className="purchase-panel"><div className="size-heading"><strong>Select size</strong><span>{available?"Available sizes":"Out of stock"}</span></div><div className="size-grid" role="group" aria-label="Available sizes">{product.sizes.map(option=>{const enabled=product.variants?.find(variant=>variant.size===option)?.available??true;return <button key={option} type="button" disabled={!enabled} aria-label={`${option}${enabled?"":" — out of stock"}`} aria-pressed={size===option} onClick={()=>{setSize(option);setMessage("")}}>{option}</button>})}</div><p className="form-message" aria-live="polite">{message}</p><div className="purchase-actions"><button className="button primary" disabled={!available} onClick={()=>commit()}>{available?`Add to bag · ${formatPrice(product.sellingPrice)}`:"Out of stock"}</button><button className="button secondary" disabled={!available} onClick={()=>commit(true)}>Buy now</button></div></div>;
}
