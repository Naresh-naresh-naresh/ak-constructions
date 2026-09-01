import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { clientConfig } from "@/config/client";
import { formatIndianCurrency } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const rate = formatIndianCurrency(clientConfig.ratePerSqFt);
const areas = clientConfig.serviceAreas.join(", ");
// Absolute, not "/images/og-image.jpg". A relative value is resolved against
// metadataBase, which the dev server rewrites to localhost — and a localhost
// og:image means no WhatsApp preview at all. Absolute removes the dependency.
const ogImage = `${clientConfig.siteUrl}/images/og-image.jpg`;

/**
 * Nobody searches "AK Constructions" unless they already know AK. The searches
 * that produce leads are "house construction cost in Chennai" and "interior
 * designers in Adyar", so the city and the rate belong in the title and
 * description rather than a generic tagline.
 *
 * `metadataBase` must be the www origin: the apex 308-redirects to it, and a
 * canonical pointing at a redirect wastes the crawl and splits ranking signals.
 */
export const metadata: Metadata = {
  metadataBase: new URL(clientConfig.siteUrl),
  title: {
    default: `${clientConfig.name} | Home Construction & Interior Design in ${clientConfig.city}`,
    template: `%s | ${clientConfig.name} ${clientConfig.city}`,
  },
  description:
    `${clientConfig.name} builds homes and designs interiors in ${clientConfig.city} from ` +
    `${rate}/sq ft — modular kitchens, wardrobes and full home builds. ` +
    `Serving ${areas}. Track your site progress online.`,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: clientConfig.siteUrl,
    siteName: clientConfig.name,
    title: `${clientConfig.name} | Home Construction & Interior Design in ${clientConfig.city}`,
    description: `Homes built and interiors designed in ${clientConfig.city} from ${rate}/sq ft. Serving ${areas}.`,
    // JPEG, not the WebP the gallery uses: WhatsApp and Facebook link scrapers
    // are unreliable with WebP, and WhatsApp is how this business shares links.
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `Modular kitchen built by ${clientConfig.name} in ${clientConfig.city}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${clientConfig.name} | ${clientConfig.city}`,
    description: `Home construction and interior design in ${clientConfig.city} from ${rate}/sq ft.`,
    images: [ogImage],
  },
  robots: { index: true, follow: true },
};

/**
 * LocalBusiness structured data. This is what lets Google show the phone number
 * and service area directly in results, and it is the on-site counterpart to the
 * Google Business Profile.
 *
 * Deliberately omits `aggregateRating` and `streetAddress`. A rating here with no
 * real reviews behind it is exactly what Google's spam policy targets, and a
 * guessed address would poison the map listing.
 */
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: clientConfig.name,
  description: clientConfig.description,
  url: clientConfig.siteUrl,
  telephone: clientConfig.phone,
  image: ogImage,
  logo: `${clientConfig.siteUrl}/images/ak-logo.webp`,
  priceRange: `${rate}/sq ft`,
  address: {
    "@type": "PostalAddress",
    addressLocality: clientConfig.city,
    addressRegion: clientConfig.region,
    addressCountry: "IN",
  },
  areaServed: clientConfig.serviceAreas.map((area) => ({
    "@type": "Place",
    name: `${area}, ${clientConfig.city}`,
  })),
  knowsAbout: [
    "home construction",
    "interior design",
    "modular kitchen",
    "wardrobe design",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          // Static object built at module scope from config, no user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-screen bg-white font-sans text-stone-900 antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
