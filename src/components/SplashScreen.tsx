import { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

const SplashScreen = ({ onComplete, minDuration = 2500 }: SplashScreenProps) => {
  const [isHiding, setIsHiding] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    // Progress animation
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(newProgress);
    }, 50);

    // Hide splash after minimum duration
    const timer = setTimeout(() => {
      setIsHiding(true);
      setTimeout(onComplete, 1000);
    }, minDuration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [minDuration, onComplete]);

  // Allow skip after 50% progress
  const handleClick = () => {
    if (progress > 50) {
      setIsHiding(true);
      setTimeout(onComplete, 1000);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-1000 cursor-pointer bg-background
        ${isHiding ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'}
      `}
    >
      {/* Background Effects - Golden Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main Golden Glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] opacity-30 animate-pulse"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 60%)'
          }}
        />
        
        {/* Secondary Glow */}
        <div 
          className="absolute top-[30%] right-[10%] w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 60%)'
          }}
        />
        
        {/* Decorative Lines */}
        <div 
          className="absolute top-[20%] -left-1/2 w-[200%] h-px -rotate-[8deg]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.15) 50%, transparent 100%)'
          }}
        />
        <div 
          className="absolute bottom-[25%] -left-1/2 w-[200%] h-px rotate-[6deg]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.1) 50%, transparent 100%)'
          }}
        />
        
        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[
            { top: '20%', left: '15%', delay: '0s' },
            { top: '40%', left: '80%', delay: '1s' },
            { top: '70%', left: '25%', delay: '2s' },
            { top: '30%', left: '60%', delay: '3s' },
            { top: '80%', left: '70%', delay: '0.5s' },
            { top: '15%', left: '45%', delay: '1.5s' },
            { top: '60%', left: '10%', delay: '2.5s' },
            { top: '50%', left: '90%', delay: '3.5s' },
          ].map((particle, index) => (
            <div
              key={index}
              className="absolute w-[3px] h-[3px] rounded-full bg-primary opacity-0"
              style={{
                top: particle.top,
                left: particle.left,
                animation: `particleFade 6s infinite ${particle.delay}`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 sm:px-8">
        {/* Logo Container */}
        <div className="w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] mx-auto mb-8 sm:mb-10 relative">
          {/* Dashed Ring */}
          <div 
            className="absolute -inset-[25px] sm:-inset-[35px] rounded-full opacity-0 border border-dashed border-primary/20"
            style={{
              animation: 'ringFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.8s forwards, ringRotate 30s linear 2s infinite'
            }}
          />
          
          {/* Outer Ring */}
          <div 
            className="absolute -inset-[15px] sm:-inset-5 rounded-full opacity-0 border border-primary/30"
            style={{
              animation: 'ringFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards, ringRotate 20s linear 2s infinite'
            }}
          />
          
          {/* Main Ring */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 border-2 border-primary"
            style={{
              animation: 'ringFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards'
            }}
          />
          
          {/* Inner Ring */}
          <div 
            className="absolute inset-[10px] rounded-full opacity-0 border border-primary/50"
            style={{
              animation: 'ringFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards, ringRotate 15s linear 2s infinite reverse'
            }}
          />
          
          {/* Pulse Ring */}
          <div 
            className="absolute -inset-[5px] rounded-full border-2 border-primary"
            style={{
              animation: 'ringPulse 3s ease-in-out 2s infinite'
            }}
          />
          
          {/* Icon Background - Golden Gradient */}
          <div 
            className="absolute inset-[18px] sm:inset-[25px] rounded-full opacity-0 shadow-lg"
            style={{
              background: 'linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 50%, hsl(var(--primary) / 0.6) 100%)',
              boxShadow: '0 20px 60px hsl(var(--primary) / 0.4), 0 10px 30px hsl(var(--background) / 0.3), inset 0 2px 20px hsl(0 0% 100% / 0.2), inset 0 -10px 30px hsl(var(--background) / 0.3)',
              animation: 'iconBgReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards'
            }}
          >
            {/* Highlight */}
            <div 
              className="absolute top-[5%] left-[10%] w-[30%] h-[20%] rounded-full blur-[5px]"
              style={{
                background: 'linear-gradient(135deg, hsl(0 0% 100% / 0.3) 0%, transparent 100%)'
              }}
            />
          </div>
          
          {/* Icon */}
          <div 
            className="absolute inset-0 flex items-center justify-center z-10 opacity-0"
            style={{
              animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.7s forwards'
            }}
          >
            <svg 
              viewBox="0 0 64 64" 
              className="w-[40px] h-[40px] sm:w-[55px] sm:h-[55px]"
              fill="none" 
              stroke="hsl(var(--primary-foreground))" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 2px 4px hsl(var(--background) / 0.3))' }}
            >
              <path d="M32 8c-8 0-14 6-14 14 0 5 2 9 5 12l3 20c0 2 2 4 4 4h4c2 0 4-2 4-4l3-20c3-3 5-7 5-12 0-8-6-14-14-14z"/>
              <circle cx="32" cy="22" r="4" strokeWidth="2"/>
              <path d="M26 22h12" strokeWidth="1.5"/>
              <path d="M28 36l4 16M36 36l-4 16" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
        
        {/* Brand */}
        <p 
          className="text-[0.65rem] sm:text-[0.7rem] tracking-[0.4em] uppercase mb-3 opacity-0 text-primary"
          style={{
            animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.9s forwards'
          }}
        >
          humana.ia
        </p>
        
        {/* Title */}
        <h1 
          className="font-display text-[clamp(2.2rem,7vw,3.5rem)] font-bold mb-2 opacity-0"
          style={{
            animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1s forwards'
          }}
        >
          <span className="bg-gradient-to-b from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
            Implant
          </span>
          <span className="bg-gradient-to-b from-primary via-primary to-primary/70 bg-clip-text text-transparent">X</span>
          <span className="text-foreground/30 font-light">™</span>
        </h1>
        
        {/* Status Indicator */}
        <div 
          className="flex items-center justify-center gap-3 sm:gap-4 mb-4 opacity-0"
          style={{
            animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1.1s forwards'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-[0.6rem] sm:text-[0.65rem] text-primary uppercase tracking-widest font-medium">IA Activa</span>
          </div>
          <span className="text-foreground/20">·</span>
          <span className="text-[0.6rem] sm:text-[0.65rem] text-muted-foreground uppercase tracking-widest">Validado Clínicamente</span>
        </div>
        
        {/* Tagline */}
        <p 
          className="text-sm sm:text-base text-muted-foreground font-light opacity-0"
          style={{
            animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1.2s forwards'
          }}
        >
          Evaluación Predictiva con IA
        </p>
        
        {/* Loader */}
        <div 
          className="mt-10 sm:mt-12 opacity-0"
          style={{
            animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1.4s forwards'
          }}
        >
          <div 
            className="w-[160px] sm:w-[200px] h-[3px] mx-auto rounded-full overflow-hidden bg-primary/15"
          >
            <div 
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7), hsl(var(--primary)))',
                backgroundSize: '200% 100%',
                animation: 'loaderShimmer 1.5s linear infinite'
              }}
            />
          </div>
          <p className="mt-4 text-[0.65rem] sm:text-xs tracking-[0.15em] uppercase text-muted-foreground">
            Iniciando análisis...
          </p>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 text-center opacity-0"
        style={{
          animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1.6s forwards'
        }}
      >
        <a 
          href="https://humanaia.cl"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.6rem] sm:text-[0.65rem] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-primary/50 hover:text-primary/70 transition-colors"
        >
          Powered by <strong className="text-primary font-medium">humana.ia</strong>
        </a>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes particleFade {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        
        @keyframes ringFadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes ringPulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }
        
        @keyframes iconBgReveal {
          from { opacity: 0; transform: scale(0.3) rotate(-20deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes loaderShimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
