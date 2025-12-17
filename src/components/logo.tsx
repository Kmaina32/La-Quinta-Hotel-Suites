
import * as React from "react";

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 6H18V8H8V16H16V18H6V6Z"
        fill="currentColor"
        className="text-primary"
      />
      <path
        d="M10 10H14V14H10V10Z"
        fill="currentColor"
        className="text-primary/70"
      />
    </svg>
  );
}
