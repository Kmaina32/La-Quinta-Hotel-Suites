import Link from 'next/link';
import { Button } from './ui/button';
import { BedDouble } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        <Link href="/" className="flex items-center gap-2">
          <BedDouble className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold">La Quita</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#gallery" className="text-muted-foreground hover:text-primary transition-colors">
            Gallery
          </Link>
          <Link href="/#rooms" className="text-muted-foreground hover:text-primary transition-colors">
            Rooms
          </Link>
          <Link href="/bookings" className="text-muted-foreground hover:text-primary transition-colors">
            My Bookings
          </Link>
          <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">
            Admin
          </Link>
        </nav>
        <Button asChild>
          <Link href="/#rooms">Book Now</Link>
        </Button>
      </div>
    </header>
  );
}
