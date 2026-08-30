"use client";
import Link from "next/link";
import { Banknote, Menu, Search, ShoppingBag, Truck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "./cart-provider";

const links = [["New Arrivals","/shop?sort=newest"],["Dresses","/shop?category=Dresses"],["Kurtis","/shop?category=Kurtis"],["Kurta Sets","/shop?category=Kurta+Sets"],["Occasion","/shop?occasion=Festive+wear"],["Best Sellers","/shop?sort=best"]];

export function Header() {
  const [open,setOpen] = useState(false);
  const { count } = useCart();
  useEffect(()=>{document.body.style.overflow=open?"hidden":"";const close=(event:KeyboardEvent)=>event.key==="Escape"&&setOpen(false);document.addEventListener("keydown",close);return()=>{document.body.style.overflow="";document.removeEventListener("keydown",close)}},[open]);
  const itemLabel = `${count} ${count===1?"item":"items"}`;
  return <>
    <div className="announcement"><span><Truck/>Free Delivery Across India</span><i aria-hidden="true"/><span><Banknote/>Cash on Delivery Available</span></div>
    <header className="site-header"><div className="header-inner"><button className="icon-button mobile-only" onClick={()=>setOpen(true)} aria-label="Open menu" aria-expanded={open}><Menu/></button><Link href="/" className="brand" aria-label="Dealstore home">deal<span>store</span></Link><nav className="desktop-nav" aria-label="Main navigation">{links.map(([label,href])=><Link key={label} href={href}>{label}</Link>)}</nav><div className="header-actions"><Link className="icon-button search-link" href="/shop" aria-label="Search products"><Search/><span>Search</span></Link><Link className="cart-link" href="/cart" aria-label={`Shopping bag with ${itemLabel}`}><ShoppingBag/><span>Bag</span>{count>0&&<b>{count}</b>}</Link></div></div></header>
    {open&&<div className="menu-backdrop" onClick={()=>setOpen(false)}><div className="mobile-menu" aria-modal="true" role="dialog" aria-label="Shopping menu" onClick={event=>event.stopPropagation()}><div className="mobile-menu-top"><span className="brand">deal<span>store</span></span><button className="icon-button" onClick={()=>setOpen(false)} aria-label="Close menu" autoFocus><X/></button></div><nav aria-label="Mobile navigation"><Link className="mobile-search" href="/shop" onClick={()=>setOpen(false)}><Search/>Search the collection</Link>{links.map(([label,href])=><Link key={label} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}</nav><p><Banknote/>Cash on Delivery available</p></div></div>}
  </>;
}
