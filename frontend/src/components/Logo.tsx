interface LogoProps {
  variant?: 'default' | 'compact' | 'horizontal';
  showTagline?: boolean;
  className?: string;
}

export default function Logo({ variant = 'default', showTagline = true, className = '' }: LogoProps) {
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-1 text-slate-700 font-bold text-2xl" style={{ letterSpacing: '0.2em' }}>
          <span className="inline-block transition-all duration-300 ease-out hover:scale-125 hover:translate-x-2 hover:text-slate-900 cursor-pointer">L</span>
          <span className="inline-block transition-all duration-300 ease-out hover:scale-125 hover:-translate-x-2 hover:text-slate-900 cursor-pointer">O</span>
          <span className="inline-block transition-all duration-300 ease-out hover:scale-125 hover:translate-x-2 hover:text-slate-900 cursor-pointer">C</span>
          <span className="inline-block transition-all duration-300 ease-out hover:scale-125 hover:-translate-x-2 hover:text-slate-900 cursor-pointer">U</span>
          <span className="inline-block transition-all duration-300 ease-out hover:scale-125 hover:translate-x-2 hover:text-slate-900 cursor-pointer">S</span>
        </div>
        {showTagline && (
          <div className="hidden md:block text-xs text-slate-600 italic border-l border-gray-300 pl-3">
            Your seat  ·  Not your bag's
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="flex flex-row items-center text-slate-700 font-bold text-lg leading-tight" style={{ letterSpacing: '0.15em' }}>
          <span className="inline-block transition-all duration-300 ease-out hover:scale-125 hover:translate-x-2 hover:text-slate-900 cursor-pointer">L</span>
          <span className="inline-block transition-all duration-300 ease-out hover:scale-125 hover:-translate-x-2 hover:text-slate-900 cursor-pointer">O</span>
          <span className="inline-block transition-all duration-300 ease-out hover:scale-125 hover:translate-x-2 hover:text-slate-900 cursor-pointer">C</span>
          <span className="inline-block transition-all duration-300 ease-out hover:scale-125 hover:-translate-x-2 hover:text-slate-900 cursor-pointer">U</span>
          <span className="inline-block transition-all duration-300 ease-out hover:scale-125 hover:translate-x-2 hover:text-slate-900 cursor-pointer">S</span>
        </div>
      </div>
    );
  }

  // Default variant - Premium slate color scheme
  return (
    <div className={`inline-flex flex-col items-center justify-center p-8 ${className}`}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .logo-letter {
          display: inline-block;
          font-size: 4rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          line-height: 1.1;
          color: rgb(51, 65, 85);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: float-in 0.6s ease-out backwards;
          cursor: pointer;
        }
        
        .logo-letter:nth-child(1) { animation-delay: 0.1s; }
        .logo-letter:nth-child(2) { animation-delay: 0.2s; }
        .logo-letter:nth-child(3) { animation-delay: 0.3s; }
        .logo-letter:nth-child(4) { animation-delay: 0.4s; }
        .logo-letter:nth-child(5) { animation-delay: 0.5s; }
        
        .logo-letter:hover {
          transform: scale(1.3) translateX(15px);
          color: rgb(15, 23, 42);
          filter: drop-shadow(0 0 20px rgba(51, 65, 85, 0.3));
        }
        
        .logo-letter:nth-child(even):hover {
          transform: scale(1.3) translateX(-15px);
        }
        
        .logo-tagline {
          margin-top: 2rem;
          font-size: 0.95rem;
          font-weight: 300;
          font-style: italic;
          letter-spacing: 0.05em;
          color: rgb(71, 85, 105);
          opacity: 0;
          animation: float-in 0.8s ease-out 0.7s forwards;
        }
        
        @media (max-width: 768px) {
          .logo-letter {
            font-size: 3rem;
          }
          .logo-tagline {
            font-size: 0.85rem;
          }
        }
      `}} />
      
      <div className="flex flex-row items-center">
        <span className="logo-letter">L</span>
        <span className="logo-letter">O</span>
        <span className="logo-letter">C</span>
        <span className="logo-letter">U</span>
        <span className="logo-letter">S</span>
      </div>
      
      {showTagline && (
        <div className="logo-tagline">
          Your seat  ·  Not your bag's
        </div>
      )}
    </div>
  );
}
