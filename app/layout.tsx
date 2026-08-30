import type { Metadata } from "next";
import "./globals.css";
import "./policy.css";
import { CartProvider } from "@/components/store/cart-provider";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://dealstore.example"),
  title: { default:"Dealstore — Women’s Fashion for Every Plan", template:"%s | Dealstore" },
  description: "Shop affordable women’s dresses, kurtis, kurta sets and occasion wear with free delivery and Cash on Delivery across India.",
  openGraph: { title:"Dealstore — Women’s Fashion for Every Plan", description:"Modern women’s fashion at accessible prices, delivered across India.", type:"website", locale:"en_IN" },
  twitter: { card:"summary_large_image", title:"Dealstore — Women’s Fashion for Every Plan", description:"Modern women’s fashion at accessible prices." },
  other: { "codex-preview": "development" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      <body><CartProvider><Header />{children}<Footer /></CartProvider></body>
    </html>
  );
}
