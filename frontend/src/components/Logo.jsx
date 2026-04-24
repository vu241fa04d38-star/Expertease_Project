// ExpertEase Logo — Abstract "E" with sparkle mark
const Logo = ({ size = 'md', theme = 'light' }) => {
  const scales = { sm: 0.7, md: 1, lg: 1.35 };
  const s = scales[size] || 1;
  const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';

  return (
    <div className="flex items-center gap-2.5" style={{ transform: `scale(${s})`, transformOrigin: 'left center' }}>
      {/* Icon Mark */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="eGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Rounded background tile */}
        <rect width="36" height="36" rx="10" fill="url(#eGrad)" />

        {/* Stylized "E" — three horizontal bars + vertical bar */}
        <rect x="9" y="9" width="4" height="18" rx="1.5" fill="white" />
        <rect x="9" y="9" width="14" height="4" rx="1.5" fill="white" />
        <rect x="9" y="16" width="11" height="4" rx="1.5" fill="white" />
        <rect x="9" y="23" width="14" height="4" rx="1.5" fill="white" />

        {/* Sparkle top-right */}
        <g opacity="0.95">
          {/* 4-point star */}
          <path d="M27 7 L27.8 9.8 L30.5 10.5 L27.8 11.2 L27 14 L26.2 11.2 L23.5 10.5 L26.2 9.8 Z" fill="white" />
        </g>

        {/* Small dot sparkle */}
        <circle cx="29.5" cy="6.5" r="1.2" fill="white" opacity="0.7" />
        <circle cx="22.5" cy="8" r="0.8" fill="white" opacity="0.5" />
      </svg>

      {/* Wordmark */}
      <div className="flex items-baseline leading-none" style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}>
        <span
          style={{
            fontSize: '19px',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            color: textColor,
            lineHeight: 1,
          }}
        >
          Expert
        </span>
        <span
          style={{
            fontSize: '19px',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            color: '#10b981',
            lineHeight: 1,
          }}
        >
          Ease
        </span>
      </div>
    </div>
  );
};

export default Logo;
