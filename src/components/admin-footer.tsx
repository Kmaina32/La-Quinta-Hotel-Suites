import Link from 'next/link';

export default function AdminFooter() {
  return (
    <footer className="mt-auto py-4">
      <div className="flex justify-center items-center h-12 bg-background/50 backdrop-blur-sm border border-dashed rounded-2xl px-4">
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
          &copy; {new Date().getFullYear()} L.Q. Master Control &bull; Built with Precision
        </p>
      </div>
    </footer>
  );
}
