import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import WhatsappButton from '@/components/whatsapp-button';
import { AuthProvider } from '@/context/auth-context';
import { PT_Sans } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'La Quinta Hotel & Suites',
  description: 'A hotel booking platform for La Quinta Hotel & Suites in Nakuru.',
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
        <AuthProvider>
          {children}
          <Toaster />
          <WhatsappButton />
        </AuthProvider>
      </body>
    </html>
  );
}
