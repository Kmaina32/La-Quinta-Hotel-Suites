
import { Facebook, Instagram, Twitter, BedDouble, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-6">
        {/* Centered Brand on Mobile, Start-aligned on Desktop */}
        <div className="flex flex-col items-center md:items-start mb-4">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <BedDouble className="h-6 w-6" />
              <span className="text-xl font-bold">La Quita</span>
            </Link>
            <p className="text-xs opacity-80 max-w-xs text-center md:text-left">
              Experience the finest hospitality and create unforgettable memories.
            </p>
        </div>

        {/* Mobile: 2-column grid, Desktop: 3-column grid (with brand moved out) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center md:text-left">
          
          {/* This empty div will be a spacer on desktop to maintain the 3-col layout */}
          <div className="hidden md:block"></div>

          {/* Contact Us - on mobile it will be the first column */}
          <div className="flex justify-center md:justify-start">
            <div>
                <h3 className="text-sm font-semibold mb-2">Contact Us</h3>
                <ul className="space-y-2 text-xs opacity-80">
                  <li>
                    <a href="https://www.google.com/maps/search/?api=1&query=-0.3293644,36.0619809" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-2 hover:opacity-100">
                      <MapPin size={14} />
                      <span>Get Directions</span>
                    </a>
                  </li>
                  <li>
                    <a href="mailto:contact@laquita.com" className="flex items-center justify-center md:justify-start gap-2 hover:opacity-100">
                      <Mail size={14} />
                      <span>contact@laquita.com</span>
                    </a>
                  </li>
                  <li>
                    <a href="tel:0759713882" className="flex items-center justify-center md:justify-start gap-2 hover:opacity-100">
                      <Phone size={14} />
                      <span>Reception: 0759713882</span>
                    </a>
                  </li>
                   <li>
                    <a href="https://wa.me/254710147434" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-2 hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                        <span>WhatsApp: 0710147434</span>
                    </a>
                  </li>
                </ul>
            </div>
          </div>

          {/* Follow Us - on mobile it will be the second column */}
          <div className="flex justify-center md:justify-start">
            <div>
                <h3 className="text-sm font-semibold mb-2">Follow Us</h3>
                <div className="flex justify-center md:justify-start space-x-2">
                  <Button size="icon" variant="ghost" asChild>
                    <Link href="#" aria-label="Facebook">
                      <Facebook size={20} />
                    </Link>
                  </Button>
                  <Button size="icon" variant="ghost" asChild>
                    <Link href="#" aria-label="Instagram">
                      <Instagram size={20} />
                    </Link>
                  </Button>
                  <Button size="icon" variant="ghost" asChild>
                    <Link href="#" aria-label="Twitter">
                      <Twitter size={20} />
                    </Link>
                  </Button>
                </div>
            </div>
          </div>
        </div>
        
        {/* Copyright notice */}
        <div className="border-t border-primary-foreground/20 mt-6 pt-4 text-center text-xs opacity-70">
          <p>&copy; {new Date().getFullYear()} La Quita. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
