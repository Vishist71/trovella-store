import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "TROVELLA | Everyday Fine Jewellery",
  description: "Shop premium 18K Gold Plated, 100% Waterproof & Anti-Tarnish fine jewellery crafted for everyday elegance.",
  keywords: ["jewellery", "anti-tarnish jewellery", "waterproof gold jewellery", "18k gold plated", "trovella jewellery", "everyday fine jewellery"],
  authors: [{ name: "TROVELLA" }],
  openGraph: {
    title: "TROVELLA | Everyday Fine Jewellery",
    description: "Anti-Tarnish • 100% Waterproof • 18K Gold Plated. Flat 50% OFF Festive Sale Live.",
    url: "https://trovella.in",
    siteName: "TROVELLA",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611591475102-4ab8c4d7342d?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "TROVELLA Luxury Fine Jewellery Preview",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TROVELLA | Everyday Fine Jewellery",
    description: "Shop premium 18K Gold Plated, Anti-Tarnish & Waterproof fine jewellery.",
    images: ["https://images.unsplash.com/photo-1611591475102-4ab8c4d7342d?q=80&w=1200&auto=format&fit=crop"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-[#FAF9F6] text-[#1A1A1A]">
        {children}
        {/* Razorpay Checkout SDK Script */}
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}