import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface KdekomLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const KdekomLogo: React.FC<KdekomLogoProps> = ({
  className = '',
  showText = true,
  size = 'md'
}) => {
  const { theme } = useTheme();
  const fillColor = theme === 'light' ? '#000000' : '#ffffff';

  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-xl' },
    lg: { icon: 40, text: 'text-3xl' },
  };

  const { icon: iconSize, text: textSize } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* K Rune Icon - Minimal version */}
      <svg
        width={iconSize}
        height={iconSize * 1.2}
        viewBox="0 0 32 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Main vertical bar */}
        <rect
          x="12"
          y="2"
          width="3"
          height="36"
          fill={fillColor}
        />

        {/* Upper diagonal (pointing right) - crosses the bar */}
        <path
          d="M4 20 L22 3 L22 6 L8 20 Z"
          fill={fillColor}
        />

        {/* Lower diagonal (pointing right) - crosses the bar */}
        <path
          d="M4 20 L22 37 L22 34 L8 20 Z"
          fill={fillColor}
        />
      </svg>

      {/* Text */}
      {showText && (
        <span className={`${textSize} font-bold text-app-text-primary tracking-tight`} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          KdeKom
        </span>
      )}
    </div>
  );
};

export default KdekomLogo;
