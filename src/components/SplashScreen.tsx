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

  // Allow skip after 2 seconds
  const handleClick = () => {
    const elapsed = Date.now();
    if (progress > 50) {
      setIsHiding(true);
      setTimeout(onComplete, 1000);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-1000 cursor-pointer
        ${isHiding ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'}
      `}
      style={{
        background: 'linear-gradient(165deg, #0a0d14 0%, #0d1117 30%, #101827 70%, #0a0d14 100%)'
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main Glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] animate-[splashGlowPulse_4s_ease-in-out_infinite]"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 60%)'
          }}
        />
        
        {/* Secondary Glow */}
        <div 
          className="absolute top-[30%] right-[10%] w-[300px] h-[300px] animate-[splashGlowPulse_5s_ease-in-out_1s_infinite]"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 60%)'
          }}
        />
        
        {/* Decorative Lines */}
        <div 
          className="absolute top-[25%] -left-1/2 w-[200%] h-px -rotate-[10deg]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.25) 50%, transparent 100%)'
          }}
        />
        <div 
          className="absolute bottom-[30%] -left-1/2 w-[200%] h-px rotate-[8deg]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.15) 50%, transparent 100%)'
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
              className="absolute w-[3px] h-[3px] rounded-full opacity-0"
              style={{
                top: particle.top,
                left: particle.left,
                background: '#3B82F6',
                animation: `particleFade 6s infinite ${particle.delay}`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-8">
        {/* Logo Container */}
        <div className="w-[180px] h-[180px] md:w-[180px] md:h-[180px] w-[140px] h-[140px] mx-auto mb-10 relative">
          {/* Dashed Ring */}
          <div 
            className="absolute -inset-[35px] md:-inset-[35px] -inset-[25px] rounded-full opacity-0"
            style={{
              border: '1px dashed rgba(59, 130, 246, 0.15)',
              animation: 'ringFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.8s forwards, ringRotate 30s linear 2s infinite'
            }}
          />
          
          {/* Outer Ring */}
          <div 
            className="absolute -inset-5 md:-inset-5 -inset-[15px] rounded-full opacity-0"
            style={{
              border: '1px solid rgba(59, 130, 246, 0.25)',
              animation: 'ringFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards, ringRotate 20s linear 2s infinite'
            }}
          />
          
          {/* Main Ring */}
          <div 
            className="absolute inset-0 rounded-full opacity-0"
            style={{
              border: '2px solid #3B82F6',
              animation: 'ringFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards'
            }}
          />
          
          {/* Inner Ring */}
          <div 
            className="absolute inset-[10px] rounded-full opacity-0"
            style={{
              border: '1px solid rgba(59, 130, 246, 0.4)',
              animation: 'ringFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards, ringRotate 15s linear 2s infinite reverse'
            }}
          />
          
          {/* Pulse Ring */}
          <div 
            className="absolute -inset-[5px] rounded-full"
            style={{
              border: '2px solid #3B82F6',
              animation: 'ringPulse 3s ease-in-out 2s infinite'
            }}
          />
          
          {/* Icon Background */}
          <div 
            className="absolute inset-[25px] md:inset-[25px] inset-[20px] rounded-full opacity-0"
            style={{
              background: 'linear-gradient(145deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
              boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3), inset 0 2px 20px rgba(255, 255, 255, 0.2), inset 0 -10px 30px rgba(0, 0, 0, 0.3)',
              animation: 'iconBgReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards'
            }}
          >
            {/* Highlight */}
            <div 
              className="absolute top-[5%] left-[10%] w-[30%] h-[20%] rounded-full blur-[5px]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%)'
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
              className="w-[60px] h-[60px] md:w-[60px] md:h-[60px] w-[45px] h-[45px]"
              fill="none" 
              stroke="white" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
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
          className="text-[0.7rem] tracking-[0.4em] uppercase mb-3 opacity-0"
          style={{
            color: '#FFC700',
            animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.9s forwards'
          }}
        >
          humana.ia
        </p>
        
        {/* Title */}
        <h1 
          className="font-display text-[clamp(2.5rem,8vw,4rem)] font-light mb-2 opacity-0"
          style={{
            color: '#F8FAFC',
            animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1s forwards'
          }}
        >
          Implant<span style={{ color: '#FFC700', fontWeight: 400 }}>X</span>™
        </h1>
        
        {/* Subtitle */}
        <p 
          className="text-base tracking-[0.15em] mb-2 opacity-0"
          style={{
            color: '#94A3B8',
            animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1.1s forwards'
          }}
        >
          Evaluación Predictiva con IA
        </p>
        
        {/* Tagline */}
        <p 
          className="font-display text-lg italic opacity-0"
          style={{
            color: 'rgba(59, 130, 246, 0.7)',
            animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1.2s forwards'
          }}
        >
          "Tu asistente Río te guiará"
        </p>
        
        {/* Loader */}
        <div 
          className="mt-12 opacity-0"
          style={{
            animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1.4s forwards'
          }}
        >
          <div 
            className="w-[180px] h-[3px] mx-auto rounded-full overflow-hidden"
            style={{ background: 'rgba(59, 130, 246, 0.15)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3B82F6, #06B6D4, #3B82F6)',
                backgroundSize: '200% 100%',
                animation: 'loaderShimmer 1.5s linear infinite'
              }}
            />
          </div>
          <p 
            className="mt-4 text-xs tracking-[0.15em] uppercase"
            style={{ color: '#94A3B8' }}
          >
            Iniciando análisis...
          </p>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center opacity-0"
        style={{
          animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1.6s forwards'
        }}
      >
        <a 
          href="https://humanaia.cl"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.65rem] tracking-[0.3em] uppercase hover:opacity-80 transition-opacity"
          style={{ color: 'rgba(255, 199, 0, 0.5)' }}
        >
          Powered by <strong style={{ color: '#FFC700', fontWeight: 500 }}>humana.ia</strong>
        </a>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes splashGlowPulse {
          0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        }
        
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
