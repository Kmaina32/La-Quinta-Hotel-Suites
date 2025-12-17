
import Link from 'next/link';
import { Logo } from './logo';

export default function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center py-6 gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">La Quita Hotel & suits</span>
        </Link>
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} La Quita. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
