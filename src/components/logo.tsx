
import * as React from "react";

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text 
        x="10" 
        y="45" 
        fontFamily="'PT Serif', serif" 
        fontSize="40" 
        fontWeight="bold" 
        fill="hsl(var(--foreground))"
      >
        L
      </text>
      <text 
        x="40" 
        y="45" 
        fontFamily="'PT Serif', serif" 
        fontSize="40" 
        fontWeight="bold" 
        fill="hsl(var(--primary))"
      >
        Q
      </text>
      <text 
        x="80" 
        y="30" 
        fontFamily="'PT Sans', sans-serif" 
        fontSize="16" 
        fill="hsl(var(--foreground))"
      >
        Hotel
      </text>
      <text 
        x="80" 
        y="50" 
        fontFamily="'PT Sans', sans-serif" 
        fontSize="16" 
        fill="hsl(var(--foreground))"
      >
        & Suites
      </text>
    </svg>
  );
}
