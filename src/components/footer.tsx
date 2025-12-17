
import Link from 'next/link';
import { Logo } from './logo';
import { Button } from './ui/button';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="sticky bottom-0 z-50 p-2 md:p-3 mt-auto">
      <div className="container mx-auto flex justify-between items-center h-16 bg-background/80 backdrop-blur-sm border rounded-xl shadow-lg px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-10 w-40 text-primary" />
        </Link>
        <div className="flex items-center justify-center flex-grow">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} L.Q. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex space-x-1">
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
    </footer>
  );
}
