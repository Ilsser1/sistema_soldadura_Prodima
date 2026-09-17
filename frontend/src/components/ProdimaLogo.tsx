import React from 'react';

interface ProdimaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  withContainer?: boolean;
}

export const ProdimaLogo: React.FC<ProdimaLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  withContainer = false,
}) => {
  const sizeMap = {
    sm: { img: 'h-8 w-8', textTitle: 'text-sm', textSub: 'text-[9px]', svg: 32 },
    md: { img: 'h-10 w-10', textTitle: 'text-base', textSub: 'text-[10px]', svg: 42 },
    lg: { img: 'h-14 w-14', textTitle: 'text-lg', textSub: 'text-xs', svg: 56 },
    xl: { img: 'h-20 w-20', textTitle: 'text-2xl', textSub: 'text-sm', svg: 80 }
  };

  const currentSize = sizeMap[size];

  const logoContent = (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/prodima_logo_transparent.png"
        alt="Logo Oficial PRODIMA Guatemala - 30 Años"
        className={`${currentSize.img} object-contain transition-transform duration-200 hover:scale-105 drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)] dark:drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)]`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = 'none';
          const fallback = target.parentElement?.querySelector('.prodima-svg-fallback');
          if (fallback) (fallback as HTMLElement).style.display = 'block';
        }}
      />

      <svg
        className={`prodima-svg-fallback hidden ${currentSize.img}`}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gold30" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="torchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="metalArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <radialGradient id="sparkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FDE047" />
            <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>

        <text
          x="35"
          y="85"
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="72"
          fill="url(#gold30)"
          letterSpacing="-3"
        >
          30
        </text>

        <path
          d="M 32 82 Q 80 62 125 78 Q 80 72 32 82 Z"
          fill="#FDE68A"
        />

        <text
          x="115"
          y="95"
          fontFamily="Brush Script MT, cursive, sans-serif"
          fontStyle="italic"
          fontSize="36"
          fill="#F59E0B"
        >
          años
        </text>

        <circle
          cx="85"
          cy="125"
          r="42"
          stroke="url(#metalArc)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray="210 55"
        />

        <line
          x1="35"
          y1="130"
          x2="78"
          y2="124"
          stroke="url(#torchGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <rect
          x="78"
          y="118"
          width="14"
          height="12"
          rx="2"
          fill="#F97316"
        />
        <rect
          x="92"
          y="120"
          width="12"
          height="8"
          rx="1"
          fill="#1E293B"
        />

        <circle cx="106" cy="124" r="14" fill="url(#sparkGlow)" />
        <line x1="106" y1="114" x2="106" y2="110" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="106" y1="134" x2="106" y2="138" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="96" y1="124" x2="92" y2="124" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="116" y1="124" x2="120" y2="124" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="106" cy="124" r="3" fill="#FFFFFF" />

        <text
          x="88"
          y="158"
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="36"
          fill="#78350F"
          stroke="#451A03"
          strokeWidth="3"
        >
          Prodima
        </text>
        <text
          x="88"
          y="158"
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="36"
          fill="url(#gold30)"
        >
          Prodima
        </text>
      </svg>
    </div>
  );

  if (!showText) {
    if (withContainer) {
      return (
        <div className="p-1.5 sm:p-2 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md backdrop-blur flex items-center justify-center">
          {logoContent}
        </div>
      );
    }
    return logoContent;
  }

  return (
    <div className="flex items-center space-x-2 sm:space-x-3">
      {withContainer ? (
        <div className="p-1 sm:p-1.5 bg-white/95 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-md backdrop-blur flex items-center justify-center">
          {logoContent}
        </div>
      ) : (
        logoContent
      )}

      <div>
        <div className="flex items-center gap-1.5">
          <span className={`font-black ${currentSize.textTitle} tracking-wide text-amber-500 dark:text-amber-400 leading-tight`}>
            PRODIMA
          </span>
          <span className="text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm">
            GUATEMALA
          </span>
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] font-bold">
            30 AÑOS
          </span>
        </div>
        <p className={`${currentSize.textSub} text-slate-500 dark:text-slate-400 hidden sm:block`}>
          ERP de Soldadura Industrial <span className="text-slate-400 dark:text-slate-500">| prodimagt.com</span>
        </p>
      </div>
    </div>
  );
};
