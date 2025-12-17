
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const adminEmail = 'gmaina424@gmail.com';

  const navLinks = [
    { href: '/#rooms', label: 'Rooms' },
    { href: '/#gallery', label: 'Gallery' },
    { href: '/about', label: 'About' },
    ...(user ? [{ href: '/bookings', label: 'My Bookings' }] : []),
    ...(user ? [{ href: '/profile', label: 'My Profile' }] : []),
    ...(user && user.email === adminEmail ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 p-2 md:p-3">
      <div className="container mx-auto flex justify-between items-center h-16 bg-background/80 backdrop-blur-sm border rounded-xl shadow-lg px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-10 w-40 text-primary" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" asChild>
              <Link
                href={link.href}
                className={cn(
                  'transition-colors relative',
                   pathname === link.href || (link.href.includes('#') && pathname === '/')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                {link.label}
                 {(pathname === link.href || (link.href.includes('#') && pathname === '/')) && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-primary rounded-full"></span>
                )}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
            {user ? (
              <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[calc(100%-0.5rem)] left-0 w-full px-2 z-40">
          <div className="bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg">
            <nav className="flex flex-col items-center gap-6 py-6">
              {navLinks.map((link) => (
                 <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'text-lg transition-colors',
                      pathname === link.href || (link.href.includes('#') && pathname === '/')
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-primary'
                    )}
                  >
                   {link.label}
                 </Link>
              ))}
              <div className="flex flex-col items-center gap-4 mt-4 w-full px-6">
                {user ? (
                    <Button size="lg" variant="outline" className="w-full" onClick={() => { handleSignOut(); setIsMenuOpen(false); }}>Sign Out</Button>
                ) : (
                  <>
                    <Button asChild size="lg" variant="ghost" className="w-full">
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                    </Button>
                    <Button asChild size="lg" className="w-full">
                        <Link href="/signup" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
