
'use client';

const PressMeArrow = () => {
  return (
    <div className="pointer-events-none absolute -top-20 right-0 z-10 hidden lg:block" style={{ transform: 'translateX(50%)' }}>
      <div className="relative flex items-center">
        <p className="mr-2 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground shadow-lg">
          Press me
        </p>
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          <path
            d="M10 90 Q 50 10, 90 50"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="path"
          />
          <path
            d="M80 40 L 90 50 L 80 60"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <style jsx>{`
        .path {
          stroke-dasharray: 150;
          stroke-dashoffset: 150;
          animation: draw 1s ease-in-out forwards;
        }
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PressMeArrow;

    