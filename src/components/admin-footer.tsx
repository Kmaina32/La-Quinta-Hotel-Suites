
import Link from 'next/link';

export default function AdminFooter() {
  return (
    <footer className="sticky bottom-0 z-50 p-2 md:p-3 mt-auto">
      <div className="container mx-auto flex justify-center items-center h-16 bg-background/80 backdrop-blur-sm border rounded-xl shadow-lg px-4">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} L.Q. Admin Panel. All rights reserved.</p>
      </div>
    </footer>
  );
}
