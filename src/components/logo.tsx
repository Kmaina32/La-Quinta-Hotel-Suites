
import * as React from "react";

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
        <path d="M32 25L32 95L44 95L44 37L68 37L68 25L32 25Z" fill="currentColor" className="text-primary" />
        <path d="M75 55C75 43.9543 83.9543 35 95 35C106.046 35 115 43.9543 115 55C115 66.0457 106.046 75 95 75C83.9543 75 75 66.0457 75 55ZM87 55C87 59.4183 90.5817 63 95 63C99.4183 63 103 59.4183 103 55C103 50.5817 99.4183 47 95 47C90.5817 47 87 50.5817 87 55Z" fill="currentColor" className="text-primary/80"/>
        <path d="M101.998 68.9976L115.126 82.1259" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-primary/80"/>
    </svg>
  );
}
