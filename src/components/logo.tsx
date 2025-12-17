
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
        <path d="M6 6V18H9V10H14V6H6Z" fill="currentColor" className="text-primary" />
        <path d="M15 6C13.3431 6 12 7.34315 12 9V15C12 16.6569 13.3431 18 15 18H18C19.6569 18 21 16.6569 21 15V9C21 7.34315 19.6569 6 18 6H15ZM15 8H18C18.5523 8 19 8.44772 19 9V15C19 15.5523 18.5523 16 18 16H15C14.4477 16 14 15.5523 14 15V9C14 8.44772 14.4477 8 15 8Z" fill="currentColor" className="text-primary/80"/>
        <path d="M17 15L20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary/80"/>
    </svg>
  );
}
