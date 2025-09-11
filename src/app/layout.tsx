
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
    url: "https://la-quita-reservations.web.app/", // Replace with your actual domain
    siteName: "La Quita",
    // images: [ // Add a default image for sharing
    //   {
    //     url: 'https://picsum.photos/seed/laquita-og/1200/630', // Replace with your logo or hero image URL
    //     width: 1200,
    //     height: 630,
    //   },
    // ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "La Quita - Hotel, Lounge & Suites",
    description: siteDescription,
    // images: ['https://picsum.photos/seed/laquita-og/1200/630'], // Replace with your logo or hero image URL
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
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
