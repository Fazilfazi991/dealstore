import type { MetadataRoute } from "next";
import { getCatalogue } from "@/lib/commerce/catalogue.server";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dealstore-five.vercel.app";
  const products = await getCatalogue();
  const policies = ["shipping-delivery", "returns-exchanges", "privacy", "terms"];
  return [{url:base,changeFrequency:"weekly",priority:1},{url:`${base}/shop`,changeFrequency:"daily",priority:.9},...products.map(product=>({url:`${base}/product/${product.slug}`,changeFrequency:"weekly" as const,priority:.8})),...policies.map(path=>({url:`${base}/${path}`,changeFrequency:"yearly" as const,priority:.3}))];
}
