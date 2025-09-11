
import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const siteUrl = "https://www.laquitahotel.com/"; 
const siteDescription = "Hotel, lounge and suites in Nakuru, Kenya along Pipeline Road offering accommodation, conference facilities, and a restaurant.";

export const metadata: Metadata = {
  title: {
    default: "La Quita - Hotel, Lounge & Suites",
    template: "%s | La Quita",
  },
  description: siteDescription,
  openGraph: {
    title: "La Quita - Hotel, Lounge & Suites",
    description: siteDescription,
    url: siteUrl,
    siteName: "La Quita",
    images: [ 
      {
        url: `${siteUrl}og-image.png`, // Using a local image
        width: 1200,
        height: 630,
        alt: "La Quita Hotel & Suites"
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "La Quita - Hotel, Lounge & Suites",
    description: siteDescription,
    images: [`${siteUrl}og-image.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": siteUrl,
  "name": "La Quita - Hotel, Lounge & Suites",
  "potentialAction": [
    {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    {
      "@type": "ViewAction",
      "name": "Explore Rooms",
      "target": `${siteUrl}#rooms`
    },
    {
      "@type": "ViewAction",
      "name": "Book Now",
      "target": `${siteUrl}#rooms`
    }
  ]
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
       <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${ptSans.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
