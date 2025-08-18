import { cn } from "@/lib/utils"

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn("h-8 w-8 text-primary", className)}
      fill="currentColor"
    >
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM11 11.76V18.9L4 15.48V8.52L11 11.76ZM13 11.76L20 8.52V15.48L13 18.9V11.76ZM12 4.52L18.6 8L12 11.48L5.4 8L12 4.52Z" />
    </svg>
  );
}
