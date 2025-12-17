
'use client';

import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ContactSection } from "@/components/contact-section";
import { usePathname } from "next/navigation";
import AdminHeader from "@/components/admin-header";
import AdminFooter from "@/components/admin-footer";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const siteUrl = "https://www.laquitahotel.com/"; 
const siteDescription = "Hotel, lounge and suits in Nakuru, Kenya along Pipeline Road offering accommodation, conference facilities, and a restaurant.";

// Note: Metadata is now defined in a client component context, which is not ideal.
// For a production app, this would be better handled by moving conditional logic
// to a client component and keeping the layout as a server component.
// However, to fulfill the request simply, we make the layout a client component.
/*
export const metadata: Metadata = {
  title: {
    default: "La Quita Hotel & suits | Nakuru, Kenya | Official Site",
    template: "%s | La Quita Hotel & suits",
  },
  description: siteDescription,
  openGraph: {
    title: "La Quita Hotel & suits | Nakuru, Kenya | Official Site",
    description: siteDescription,
    url: siteUrl,
    siteName: "La Quita",
    images: [ 
      {
        url: `${siteUrl}og-image.png`, // Using a local image
        width: 1200,
        height: 630,
        alt: "La Quita Hotel & suits"
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "La Quita Hotel & suits | Nakuru, Kenya | Official Site",
    description: siteDescription,
    images: [`${siteUrl}og-image.png`],
  },
};
*/

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": siteUrl,
  "name": "La Quita - Hotel, Lounge & suits",
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
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="en" className="h-full">
       <head>
        <title>La Quita Hotel & suits | Nakuru, Kenya | Official Site</title>
        <meta name="description" content={siteDescription} />
        {/* Add other head elements here as needed, since static metadata object is removed */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${ptSans.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          {isAdminPage ? <AdminHeader /> : <Header />}
          <main className="flex-grow">{children}</main>
          {isAdminPage ? <AdminFooter /> : (
            <>
              <ContactSection />
              <Footer />
            </>
          )}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
