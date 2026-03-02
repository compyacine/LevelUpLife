interface DigitProLogoProps {
  size?: number;
  showText?: boolean;
  textSize?: string;
  variant?: 'full' | 'icon' | 'horizontal' | 'badge';
  className?: string;
  animated?: boolean;
  glowing?: boolean;
  onClick?: () => void;
}

export default function DigitProLogo({
  size = 40,
  showText = true,
  textSize = 'text-lg',
  variant = 'full',
  className = '',
  animated = false,
  glowing = false,
  onClick,
}: DigitProLogoProps) {


  const renderIcon = () => (
    <div
      className={`relative flex items-center justify-center shrink-0 ${animated ? 'pulse-scale' : ''} ${glowing ? 'logo-glow' : ''}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src="/logo.png"
        alt="LevelUp life Logo"
        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '15%' }}
        onError={(e) => {
          // Fallback if image is not placed yet
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.innerHTML += `<div class="w-full h-full rounded-2xl flex items-center justify-center bg-indigo-600 text-white font-black text-xs">DP</div>`;
        }}
      />

      {/* Glow effect */}
      {glowing && (
        <div
          className="absolute inset-0 rounded-[25%] opacity-40 blur-xl"
          style={{
            background: 'linear-gradient(135deg, #0f172a, #38bdf8)',
            animation: 'pulseGlow 2s ease-in-out infinite',
            zIndex: -1
          }}
        />
      )}
    </div>
  );

  const renderText = () => (
    <div className="flex flex-col leading-tight">
      <span
        className={`${textSize} font-black tracking-tight`}
        style={{
          color: '#0f172a', /* Dark blue color from the image */
        }}
      >
        DigitPro
      </span>
      {variant === 'full' && (
        <span
          className="text-[11px] font-bold"
          style={{ color: '#0ea5e9' }} /* Light blue from the 'Store' part */
        >
          Store
        </span>
      )}
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex ${className}`} onClick={onClick} role={onClick ? 'button' : undefined} style={{ cursor: onClick ? 'pointer' : undefined }}>
        {renderIcon()}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08))',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          cursor: onClick ? 'pointer' : undefined,
        }}
      >
        {renderIcon()}
        {showText && (
          <span
            className="text-xs font-black"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #A855F7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            DigitPro
          </span>
        )}
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div
        className={`inline-flex items-center gap-3 ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        style={{ cursor: onClick ? 'pointer' : undefined }}
      >
        {renderIcon()}
        {showText && renderText()}
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {renderIcon()}
      {showText && renderText()}
    </div>
  );
}

// Compact inline version for footers
export function DigitProInline({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-black tracking-tight ${className}`}
      style={{
        color: '#0f172a',
      }}
    >
      DigitPro <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>Store</span>
    </span>
  );
}
