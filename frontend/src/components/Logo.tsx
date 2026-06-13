interface LogoProps {
  variant?: 'default' | 'compact' | 'horizontal';
  showTagline?: boolean;
  className?: string;
}

const letters = ['L', 'O', 'C', 'U', 'S'] as const;

function LogoWordmark({ size, compact }: { size: number; compact?: boolean }) {
  return (
    <div className={`locus-wordmark ${compact ? 'locus-wordmark-compact' : ''}`}>
      {letters.map((letter, index) => (
        <span
          key={letter}
          className={`locus-letter ${letter === 'O' ? 'locus-letter-o' : ''}`}
          style={{
            '--logo-size': `${size}px`,
            '--letter-delay': `${0.08 + index * 0.12}s`,
            '--float-delay': `${1.4 + index * 0.2}s`,
          } as React.CSSProperties}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

export default function Logo({ variant = 'default', showTagline = true, className = '' }: LogoProps) {
  const compact = variant === 'compact';
  const size = compact ? 32 : variant === 'horizontal' ? 64 : 112;

  return (
    <div className={`locus-logo ${variant} ${className}`.trim()}>
      <style dangerouslySetInnerHTML={{ __html: `
        .locus-logo {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #0f172a;
        }

        .locus-logo.default {
          flex-direction: column;
          gap: 18px;
          padding: 32px;
          width: fit-content;
          max-width: min(100%, calc(100vw - 32px));
          overflow: visible;
        }

        .locus-logo.horizontal {
          flex-direction: row;
          gap: 18px;
        }

        .locus-logo.compact {
          flex-direction: column;
          gap: 0;
          padding: 0;
        }

        .locus-wordmark {
          display: flex;
          align-items: baseline;
          line-height: 1;
          letter-spacing: -0.05em;
          white-space: nowrap;
        }

        .locus-wordmark-compact {
          letter-spacing: 0.08em;
        }

        .locus-letter {
          --logo-size: 112px;
          position: relative;
          display: inline-block;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: var(--logo-size);
          line-height: 1;
          opacity: 0;
          transform: translateY(60px) skewX(-8deg);
          background: linear-gradient(155deg, #3730a3 0%, #4f46e5 35%, #7c3aed 70%, #6d28d9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: locus-letter-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .locus-letter:nth-child(odd) {
          animation: locus-letter-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, locus-float-a 5s ease-in-out infinite;
          animation-delay: var(--letter-delay), var(--float-delay);
        }

        .locus-letter:nth-child(even) {
          animation: locus-letter-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, locus-float-b 5s ease-in-out infinite;
          animation-delay: var(--letter-delay), var(--float-delay);
        }

        .locus-letter::after {
          content: '';
          position: absolute;
          inset: 14px;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
        }

        .locus-letter-o::after {
          opacity: 1;
          border: 2px solid rgba(109, 40, 217, 0.22);
          animation: locus-ring-pop 0.5s 0.9s cubic-bezier(0.34, 1.8, 0.64, 1) both, locus-ring-glow 3s 1.5s ease-in-out infinite;
        }

        .locus-wordmark-compact .locus-letter {
          font-size: 32px;
          opacity: 1;
          transform: none;
          animation: none;
        }

        .locus-wordmark-compact .locus-letter-o::after {
          inset: 4px;
          border-width: 1.5px;
          animation: none;
        }

        .locus-underline {
          height: 3px;
          width: 0;
          border-radius: 9999px;
          align-self: stretch;
          background: linear-gradient(90deg, #4f46e5, #7c3aed, #4f46e5, #7c3aed);
          background-size: 200% 100%;
          animation: locus-bar-expand 0.65s 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards, locus-bar-shimmer 3s 1.6s linear infinite;
        }

        .locus-tagline {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #4f46e5, #7c3aed, #4f46e5);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0;
          animation: locus-tag-fade 0.7s 1.3s ease forwards, locus-tag-shimmer 4s 2.2s linear infinite;
        }

        .locus-logo.horizontal .locus-tagline {
          font-size: 14px;
          letter-spacing: 0.24em;
          white-space: nowrap;
        }

        .locus-logo.compact .locus-tagline,
        .locus-logo.compact .locus-underline {
          display: none;
        }

        @keyframes locus-letter-in {
          to {
            opacity: 1;
            transform: translateY(0) skewX(0deg);
          }
        }

        @keyframes locus-float-a {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }

        @keyframes locus-float-b {
          0%, 100% { transform: translateY(-4px); }
          50% { transform: translateY(4px); }
        }

        @keyframes locus-ring-pop {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes locus-ring-glow {
          0%, 100% { border-color: rgba(109, 40, 217, 0.2); }
          50% { border-color: rgba(109, 40, 217, 0.5); box-shadow: 0 0 10px rgba(109, 40, 217, 0.12); }
        }

        @keyframes locus-bar-expand {
          to { width: 100%; }
        }

        @keyframes locus-bar-shimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        @keyframes locus-tag-fade {
          from { opacity: 0; letter-spacing: 0.45em; }
          to { opacity: 1; letter-spacing: 0.28em; }
        }

        @keyframes locus-tag-shimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .locus-letter,
          .locus-underline,
          .locus-tagline,
          .locus-letter-o::after {
            animation: none !important;
          }

          .locus-letter {
            opacity: 1;
            transform: none;
          }

          .locus-tagline {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .locus-logo.default {
            padding: 16px;
          }

          .locus-logo.default .locus-letter {
            --logo-size: 56px;
          }

          .locus-logo.default .locus-tagline {
            font-size: 12px;
            letter-spacing: 0.18em;
          }

          .locus-logo.horizontal {
            gap: 12px;
          }

          .locus-logo.horizontal .locus-letter {
            --logo-size: 42px;
          }
        }
      `}} />

      <LogoWordmark size={size} compact={compact} />

      {variant === 'default' && <div className="locus-underline" />}

      {showTagline && (
        <div className="locus-tagline">
          Your seat &nbsp;·&nbsp; Not your bag&apos;s
        </div>
      )}
    </div>
  );
}
