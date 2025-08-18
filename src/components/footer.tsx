import Link from 'next/link';
import { Facebook, Twitter, Instagram, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-secondary">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center">
            <span className="font-headline text-xl font-bold">La Quinta Hotel & Suites</span>
          </Link>
          <p className="max-w-xs text-muted-foreground">
            Experience comfort and luxury at La Quinta Hotel & Suites, Nakuru.
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
           <h4 className="font-headline font-semibold">Contact Us</h4>
            <ul className="mt-4 space-y-2">
                <li className='flex items-center gap-2 text-sm'>
                    <Phone className="h-4 w-4" />
                    <a href="tel:0759713882" className="hover:text-primary">0759713882</a>
                </li>
                <li className='flex items-center gap-2 text-sm'>
                    <MapPin className="h-4 w-4" />
                    <span>Nakuru, Kenya</span>
                </li>
                 <li>
                    <a
                      href="https://www.google.com/maps/place/La+Quita+Hotel+and+Suites/@-0.329362,36.1430954,18z"
                      target="_blank"
                      rel="noopener noreferrer"
                       className="text-sm hover:text-primary"
                    >
                      View on Map
                    </a>
                </li>
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
            &copy; {new Date().getFullYear()} La Quinta Hotel & Suites. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
