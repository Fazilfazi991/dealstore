"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Banknote, PackageCheck } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  { title:"Fresh styles just landed.", copy:"Easy-to-wear fashion for everyday plans and special moments.", cta:"Shop new arrivals", href:"/shop?sort=newest", image:"/images/MSH-WES-007/01-catalogue-hero.png", alt:"Pink tiered georgette maxi dress from Dealstore" },
  { title:"Easy looks. Prices you’ll love.", copy:"Comfortable kurtis made for workdays, errands and everything after.", cta:"Shop everyday wear", href:"/shop?category=Kurtis", image:"/images/MSH-ETH-001/03-occasion-lifestyle.png", alt:"Black printed cotton kurti styled for everyday wear" },
  { title:"Made for plans worth dressing up for.", copy:"Polished sets and flowing silhouettes for celebrations big and small.", cta:"Shop occasion wear", href:"/shop?occasion=Festive+wear", image:"/images/MSH-SET-004/03-occasion-lifestyle.png", alt:"Purple three-piece occasion set from Dealstore" },
];

export function HeroCarousel() {
  const [viewportRef, embla] = useEmblaCarousel({ loop:true, align:"start" });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const interacted = useRef(false);
  const select = useCallback(() => embla && setSelected(embla.selectedScrollSnap()), [embla]);

  useEffect(() => {
    if (!embla) return;
    const stop = () => { interacted.current = true; setPaused(true); };
    embla.on("select", select);
    embla.on("pointerDown", stop);
    return () => { embla.off("select", select); embla.off("pointerDown", stop); };
  }, [embla, select]);

  useEffect(() => {
    if (!embla || paused || interacted.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => embla.scrollNext(), 6000);
    return () => clearInterval(timer);
  }, [embla, paused]);

  const control = (direction:"prev"|"next") => {
    interacted.current = true;
    setPaused(true);
    if (direction === "prev") embla?.scrollPrev();
    else embla?.scrollNext();
  };

  return <section className="hero-carousel page-width" aria-roledescription="carousel" aria-label="Featured Dealstore collections" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocus={()=>setPaused(true)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPaused(false)}} onKeyDown={event=>{if(event.key==="ArrowLeft")control("prev");if(event.key==="ArrowRight")control("next")}}>
    <div className="hero-viewport" ref={viewportRef}><div className="hero-track">{slides.map((slide,index)=><article className="hero-slide" key={slide.title} aria-roledescription="slide" aria-label={`${index+1} of ${slides.length}`} aria-hidden={selected!==index}><div className="hero-copy"><h1>{slide.title}</h1><p>{slide.copy}</p><Link href={slide.href} className="button primary" tabIndex={selected===index?0:-1}>{slide.cta}<ArrowRight/></Link><div className="hero-trust" aria-label="Shopping benefits"><span><Banknote/>Cash on Delivery</span><span><PackageCheck/>FREE Delivery</span></div></div><div className="hero-media"><Image src={slide.image} alt={slide.alt} fill priority={index===0} sizes="(max-width:900px) 100vw,48vw"/></div></article>)}</div></div>
    <div className="hero-controls"><div className="hero-dots" role="group" aria-label="Choose a hero slide">{slides.map((slide,index)=><button key={slide.title} type="button" aria-label={`Show slide ${index+1}: ${slide.title}`} aria-current={selected===index?"true":undefined} onClick={()=>{interacted.current=true;setPaused(true);embla?.scrollTo(index)}}/>)}</div><div className="hero-arrows"><button type="button" onClick={()=>control("prev")} aria-label="Previous slide"><ArrowLeft/></button><button type="button" onClick={()=>control("next")} aria-label="Next slide"><ArrowRight/></button></div></div>
  </section>;
}
