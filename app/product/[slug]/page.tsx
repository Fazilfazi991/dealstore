import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Banknote, PackageCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { ProductPurchase } from "@/components/store/product-purchase";
import { findCatalogueProduct, getCatalogue } from "@/lib/commerce/catalogue.server";
import { formatPrice, hasVariablePrices } from "@/lib/products";

export async function generateStaticParams() { return (await getCatalogue()).map(product => ({ slug: product.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await findCatalogueProduct((await params).slug);
  if (!product) return {};
  return { title: product.name, description: product.description, alternates: { canonical: `/product/${product.slug}` }, openGraph: { title: product.name, description: product.description, images: [{ url: product.images[0], alt: product.name }] }, twitter: { card: "summary_large_image", title: product.name, description: product.description, images: [product.images[0]] } };
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await findCatalogueProduct((await params).slug);
  if (!product) notFound();
  const inStock = product.variants?.some(variant => variant.available) ?? product.sizes.length > 0;
  const jsonLd = { "@context": "https://schema.org", "@type": "Product", name: product.name, image: product.images, description: product.description, sku: product.id, brand: { "@type": "Brand", name: "Dealstore" }, offers: { "@type": "Offer", priceCurrency: "INR", price: product.sellingPrice, availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://dealstore-five.vercel.app"}/product/${product.slug}` } };
  return <main className="page-shell product-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/shop">Shop</Link><span>/</span><span>{product.name}</span></nav><div className="pdp-layout"><div className="gallery">{product.images.slice(0,5).map((image,index)=><div className="gallery-image" key={image}><Image src={image} alt={index===0?product.name:`${product.name}, view ${index+1}`} fill priority={index===0} sizes="(max-width:767px) 92vw,42vw"/></div>)}</div><section className="pdp-info"><p className="pdp-category">{product.category} · {product.occasion}</p><h1>{product.name}</h1><p className="pdp-price">{hasVariablePrices(product)?"From ":""}{formatPrice(product.sellingPrice)}</p><div className="pdp-trust" aria-label="Purchase benefits"><span><Banknote/>Cash on Delivery available</span><span><PackageCheck/>FREE delivery across India</span></div><p className="pdp-description">{product.description}</p><ProductPurchase product={product}/><dl className="product-details"><div><dt>Material</dt><dd>{product.material}</dd></div><div><dt>Colour</dt><dd>{product.colour}</dd></div><div><dt>Available sizes</dt><dd>{product.variants?.filter(variant=>variant.available).map(variant=>variant.size).join(", ") || "Currently unavailable"}</dd></div><div><dt>Product code</dt><dd>{product.id}</dd></div></dl><div className="policy-note"><strong>Simple delivery, clear total</strong><p>Standard delivery is free. Delivery timing and returns eligibility will be shown when these policies are approved.</p></div></section></div></main>;
}
