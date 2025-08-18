import { cn } from "@/lib/utils"

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-8 w-8 text-primary", className)}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59V18h-2v-1.5a2.5 2.5 0 0 1 5 0V18h-2v-1.41A5.002 5.002 0 0 0 12 7a5 5 0 0 0-1 9.59zM12 9a3 3 0 0 1 0 6 3 3 0 0 1 0-6z" />
      <path d="M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    </svg>
  );
}
