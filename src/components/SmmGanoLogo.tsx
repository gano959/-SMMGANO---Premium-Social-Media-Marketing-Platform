import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const SmmGanoLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const iconSize = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
  }[size];

  const textSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblem: Modern Growth Diamond + Interconnected Pulse Node */}
      <div
        className={`${iconSize} rounded-xl bg-gradient-to-br from-[#800020] via-[#A32645] to-[#5C0018] flex items-center justify-center text-white shadow-md shadow-[#800020]/25 relative shrink-0 transition-transform hover:scale-105`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5/9 h-5/9 drop-shadow-xs"
        >
          {/* Exponential growth curve with social broadcast dots */}
          <path d="M4 19L10 13L14 17L20 7" />
          <path d="M15 7H20V12" />
          <circle cx="4" cy="19" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight leading-none">
          <span className={`font-black ${textSize} text-[#800020] dark:text-[#f3a4b6] tracking-tighter`}>
            SMM
          </span>
          <span className={`font-extrabold ${textSize} text-[#242126] dark:text-white tracking-tight`}>
            GANO
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#706B72] dark:text-slate-400 mt-0.5">
            Social Growth Engine
          </span>
        )}
      </div>
    </div>
  );
};
