import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Cursor } from "@/components/cursor/Cursor";
import { brand, contact, getChannels, heroImages, services } from "@/content/site";
import { unsplashCrop } from "@/lib/unsplash";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const title = `${brand.name} — ${brand.descriptor}`;
const ogImage = unsplashCrop(heroImages.portrait.src, 1200, 630);

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: { default: title, template: `%s — ${brand.name}` },
  description: brand.description,
  applicationName: brand.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: brand.name,
    title,
    description: brand.description,
    images: [{ url: ogImage, width: 1200, height: 630, alt: heroImages.portrait.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: brand.description,
    images: [ogImage],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0806",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/** schema.org BeautySalon — only fields the client has actually supplied. */
function structuredData() {
  const sameAs = getChannels()
    .filter((c) => c.kind === "instagram" || c.kind === "tiktok")
    .map((c) => c.href);
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: brand.name,
    description: brand.description,
    url: brand.url,
    image: ogImage,
    ...(contact.phone && { telephone: contact.phone }),
    ...(contact.email && { email: contact.email }),
    ...(contact.address && { address: contact.address }),
    ...(contact.mapsUrl && { hasMap: contact.mapsUrl }),
    ...(sameAs.length && { sameAs }),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.name, description: s.description },
      })),
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={brand.locale} className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* Flag JS before first paint so pre-reveal text can be hidden without a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');if('scrollRestoration' in history)history.scrollRestoration='manual';",
          }}
        />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-champagne focus:px-5 focus:py-3 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-[0.2em] focus:text-ink"
        >
          Skip to content
        </a>
        <SmoothScroll>{children}</SmoothScroll>
        <Cursor />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
