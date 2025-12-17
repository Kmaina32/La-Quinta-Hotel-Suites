
import Link from 'next/link';
import { Logo } from './logo';

export default function Footer() {
  return (
    <footer className="sticky bottom-0 z-50 p-2 md:p-3">
      <div className="container mx-auto flex justify-between items-center h-16 bg-background/80 backdrop-blur-sm border rounded-xl shadow-lg px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">La Quita Hotel & suits</span>
        </Link>
        <div className="text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} La Quita. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
