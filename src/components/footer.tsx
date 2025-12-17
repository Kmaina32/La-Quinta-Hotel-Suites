
import Link from 'next/link';
import { Logo } from './logo';
import { Button } from './ui/button';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="sticky bottom-0 z-50 p-2 md:p-3 mt-auto">
      <div className="container mx-auto flex justify-between items-center h-16 bg-background/80 backdrop-blur-sm border rounded-xl shadow-lg px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">La Quita Hotel & suits</span>
        </Link>
        <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground hidden sm:block">&copy; {new Date().getFullYear()} La Quita. All rights reserved.</p>
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
