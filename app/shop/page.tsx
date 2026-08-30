import type { Metadata } from "next";
import { ShopBrowser } from "@/components/store/shop-browser";
import { getCatalogue } from "@/lib/commerce/catalogue.server";

export const metadata: Metadata = { title: "Shop Women’s Fashion", description: "Browse Dealstore dresses, kurtis, kurta sets and gowns with free delivery across India." };
export default async function Shop({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  const [query, products] = await Promise.all([searchParams, getCatalogue()]);
  return <main className="page-shell"><div className="page-heading"><h1>Find your next favourite</h1><p>Dresses, kurtis and occasion styles chosen to make shopping simple.</p></div><ShopBrowser products={products} initialCategory={query.category || ""} initialSort={query.sort || ""} /></main>;
}
