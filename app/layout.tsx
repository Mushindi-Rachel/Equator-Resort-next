import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const siteUrl = "https://www.equator-resort.com";
const siteName = "Equator Christian Retreat & Conference Centre";
const siteDescription =
  "Equator Christian Retreat & Conference Centre in Gambogi, Vihiga County, Kenya — sitting on Latitude Zero. Book rooms, conference facilities, and Christian retreats for churches, families, and organizations.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Gambogi, Vihiga County, Kenya`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Equator Christian Retreat Centre",
    "Christian retreat centre Kenya",
    "conference centre Vihiga County",
    "Gambogi retreat centre",
    "church retreat Kenya",
    "conference venue Kenya",
    "Latitude Zero Kenya",
    "hotel accommodation Vihiga",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "Travel & Hospitality",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/logo-equator.png",
    shortcut: "/logo-equator.png",
    apple: "/logo-equator.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title: `${siteName} | Gambogi, Vihiga County, Kenya`,
    description: siteDescription,
    images: [
      {
        url: "/entrance.jpeg",
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Gambogi, Vihiga County, Kenya`,
    description: siteDescription,
    images: ["/entrance.jpeg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f2818",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  image: `${siteUrl}/entrance.jpeg`,
  logo: `${siteUrl}/logo-equator.png`,
  telephone: "+254792888828",
  priceRange: "KES",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Gambogi",
    addressLocality: "Gambogi",
    addressRegion: "Vihiga County",
    addressCountry: "KE",
  },
  // TODO: replace with the retreat centre's actual GPS coordinates for map/local-SEO accuracy.
  geo: {
    "@type": "GeoCoordinates",
    latitude: 0.0020348785732982144,
    longitude: 34.744493410114835,
  },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Conference Facilities" },
    { "@type": "LocationFeatureSpecification", name: "Restaurant" },
    { "@type": "LocationFeatureSpecification", name: "Christian Retreat Programs" },
  ],
  sameAs: ["https://www.facebook.com/equatorresortgambogi/"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
