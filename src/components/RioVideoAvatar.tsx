import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RioVideoAvatarProps {
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
}

const RioVideoAvatar = ({ 
  autoPlay = true, 
  muted = false, 
  loop = false,
  className 
}: RioVideoAvatarProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && autoPlay) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, user needs to interact
      });
    }
  }, [autoPlay]);

  return (
    <div className={cn("relative mx-auto", className)}>
      {/* Glow effect behind video */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-blue/30 via-cyan/20 to-medical-blue/30 blur-2xl scale-110" />
      
      {/* Video container */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/20">
        <video
          ref={videoRef}
          src="/rio-welcome-video.mp4"
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          className="w-full h-[120%] object-cover object-[center_25%]"
        />
      </div>
      
      {/* Online indicator */}
      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full border border-accent-blue/30">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-medium text-foreground/80">En línea</span>
      </div>
    </div>
  );
};

export default RioVideoAvatar;
