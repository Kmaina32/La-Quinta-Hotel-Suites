
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import WhatsappButton from '@/components/whatsapp-button';
import { PT_Sans } from 'next/font/google';
import React from 'react';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'La Quita',
  description: 'A hotel booking platform for La Quita in Nakuru.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          ptSans.variable
        )}
      >
        <React.Suspense fallback={<div>Loading...</div>}>
            {children}
        </React.Suspense>
        <Toaster />
        <WhatsappButton />
      </body>
    </html>
  );
}
