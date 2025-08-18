import Link from 'next/link';
import { Hotel, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-secondary">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Hotel className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl font-bold">Laquinta Reservations</span>
          </Link>
          <p className="max-w-xs text-muted-foreground">
            Experience comfort and luxury at Laquinta Hotel & Suites, Nakuru.
          </p>
        </div>
        <div>
          <h4 className="font-headline font-semibold">Quick Links</h4>
          <ul className="mt-4 space-y-2">
            <li><Link href="/" className="text-sm hover:text-primary">Home</Link></li>
            <li><Link href="/#rooms" className="text-sm hover:text-primary">Rooms</Link></li>
            <li><Link href="/bookings" className="text-sm hover:text-primary">My Bookings</Link></li>
            <li><Link href="/support" className="text-sm hover:text-primary">Contact & Support</Link></li>
            <li><Link href="/admin" className="text-sm hover:text-primary">Admin</Link></li>
          </ul>
        </div>
        <div>
           <h4 className="font-headline font-semibold">Connect With Us</h4>
           <div className="mt-4 flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Instagram className="h-5 w-5" />
            </Link>
           </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Laquinta Reservations. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
