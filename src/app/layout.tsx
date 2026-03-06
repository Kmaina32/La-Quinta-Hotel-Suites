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
import AdminHeader from "@/components/header"; // This will be updated below
import AdminSidebar from "@/components/admin-sidebar";
import DashboardHeader from "@/components/admin-header";
import AdminFooter from "@/components/admin-footer";
import { useEffect, useState } from "react";
import { getSiteSettings } from "@/lib/actions";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const siteUrl = "https://www.laquitahotel.com/"; 
const siteDescription = "Hotel, lounge and suits in Nakuru, Kenya along Pipeline Road offering accommodation, conference facilities, and a restaurant.";

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
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    async function fetchTheme() {
        const settings = await getSiteSettings();
        setTheme(settings.activeTheme || 'default');
    }
    fetchTheme();
  }, [pathname]);

  return (
    <html lang="en" className="h-full" data-theme={theme}>
       <head>
        <title>La Quita Hotel & suits | Nakuru, Kenya | Official Site</title>
        <meta name="description" content={siteDescription} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${ptSans.className} flex flex-col min-h-screen bg-muted/5 transition-colors duration-500`}>
        <AuthProvider>
          {isAdminPage ? (
            <div className="flex min-h-screen bg-muted/10">
              <AdminSidebar />
              <div className="flex-1 flex flex-col pl-28 pr-4 md:pr-8 gap-8 pb-8">
                <DashboardHeader />
                <main className="flex-1 bg-background rounded-[2.5rem] border shadow-sm p-8 overflow-hidden">
                  {children}
                </main>
                <AdminFooter />
              </div>
            </div>
          ) : (
            <>
              <Header />
              <main className="flex-grow">{children}</main>
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
