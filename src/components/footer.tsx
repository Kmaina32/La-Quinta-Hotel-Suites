import { Facebook, Instagram, Twitter, BedDouble } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <Link href="/" className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <BedDouble className="h-8 w-8" />
              <span className="text-2xl font-bold">La Quita</span>
            </Link>
            <p className="text-sm opacity-80">
              Experience the finest hospitality and create unforgettable memories.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>123 Luxury Lane, Metropolis</li>
              <li>Email: contact@laquita.com</li>
              <li>Phone: +1 (234) 567-890</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link href="#" className="opacity-80 hover:opacity-100">
                <Facebook size={24} />
              </Link>
              <Link href="#" className="opacity-80 hover:opacity-100">
                <Instagram size={24} />
              </Link>
              <Link href="#" className="opacity-80 hover:opacity-100">
                <Twitter size={24} />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-70">
          <p>&copy; {new Date().getFullYear()} La Quita. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
