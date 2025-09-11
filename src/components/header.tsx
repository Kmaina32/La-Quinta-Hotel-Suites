
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { BedDouble, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        <Link href="/" className="flex items-center gap-2">
          <BedDouble className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold">La Quita</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#gallery" className="text-muted-foreground hover:text-primary transition-colors">
            Gallery
          </Link>
          <Link href="/#rooms" className="text-muted-foreground hover:text-primary transition-colors">
            Rooms
          </Link>
          {user && (
            <Link href="/bookings" className="text-muted-foreground hover:text-primary transition-colors">
              My Bookings
            </Link>
          )}
          <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">
            Admin
          </Link>
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
        <div className="md:hidden absolute top-20 left-0 w-full bg-background/95 backdrop-blur-sm z-40">
          <nav className="flex flex-col items-center gap-6 py-6">
            <Link href="/#gallery" onClick={() => setIsMenuOpen(false)} className="text-lg text-muted-foreground hover:text-primary transition-colors">
                Gallery
            </Link>
            <Link href="/#rooms" onClick={() => setIsMenuOpen(false)} className="text-lg text-muted-foreground hover:text-primary transition-colors">
                Rooms
            </Link>
            {user && (
              <Link href="/bookings" onClick={() => setIsMenuOpen(false)} className="text-lg text-muted-foreground hover:text-primary transition-colors">
                  My Bookings
              </Link>
            )}
            <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="text-lg text-muted-foreground hover:text-primary transition-colors">
                Admin
            </Link>
            <div className="flex flex-col items-center gap-4 mt-4">
              {user ? (
                  <Button size="lg" variant="outline" onClick={() => { handleSignOut(); setIsMenuOpen(false); }}>Sign Out</Button>
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
      )}
    </header>
  );
}
