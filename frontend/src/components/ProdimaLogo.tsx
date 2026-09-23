import React from 'react';

interface ProdimaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ProdimaLogo: React.FC<ProdimaLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: { img: 'h-8 w-8' },
    md: { img: 'h-10 w-10' },
    lg: { img: 'h-14 w-14' },
    xl: { img: 'h-20 w-20' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/prodima_logo_transparent.png"
        alt="Logo Oficial PRODIMA Guatemala - 30 Años"
        className={`${currentSize.img} object-contain transition-transform duration-200 hover:scale-105 drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)] dark:drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)]`}
      />
    </div>
  );

};
