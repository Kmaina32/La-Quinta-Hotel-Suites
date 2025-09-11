import { Facebook, Instagram, Twitter, BedDouble } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <BedDouble className="h-6 w-6" />
              <span className="text-xl font-bold">La Quita</span>
            </Link>
            <p className="text-xs opacity-80 max-w-xs">
              Experience the finest hospitality and create unforgettable memories.
            </p>
          </div>
          <div className="text-xs opacity-80">
            <h3 className="text-sm font-semibold mb-2">Contact Us</h3>
            <ul className="space-y-1">
              <li>-0.3293644,36.0619809,12z</li>
              <li>Email: contact@laquita.com</li>
              <li>Reception: 0759713882</li>
              <li>WhatsApp: 0710147434</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-3">
              <Link href="#" className="opacity-80 hover:opacity-100">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="opacity-80 hover:opacity-100">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="opacity-80 hover:opacity-100">
                <Twitter size={20} />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-6 pt-4 text-center text-xs opacity-70">
          <p>&copy; {new Date().getFullYear()} La Quita. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
