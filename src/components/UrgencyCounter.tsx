import { useState, useEffect } from "react";
import { Clock, Users, Zap } from "lucide-react";

interface UrgencyCounterProps {
  className?: string;
}

const UrgencyCounter = ({ className }: UrgencyCounterProps) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [viewersCount, setViewersCount] = useState(0);

  useEffect(() => {
    // Calculate time until midnight
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
    };

    // Set initial viewers count (between 12-28)
    setViewersCount(Math.floor(Math.random() * 16) + 12);

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    // Occasionally update viewers count
    const viewersTimer = setInterval(() => {
      setViewersCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(8, Math.min(35, prev + change));
      });
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(viewersTimer);
    };
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className={className}>
      {/* Urgency banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30 rounded-xl p-4 space-y-3">
        {/* Countdown */}
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            Oferta expira en:
          </span>
          <div className="flex items-center gap-1 font-mono text-lg font-bold text-amber-500">
            <span className="bg-background/80 px-2 py-0.5 rounded">{formatNumber(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-background/80 px-2 py-0.5 rounded">{formatNumber(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-background/80 px-2 py-0.5 rounded animate-pulse">{formatNumber(timeLeft.seconds)}</span>
          </div>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>
              <strong className="text-foreground">{viewersCount}</strong> personas viendo ahora
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>
              <strong className="text-foreground">127</strong> compras hoy
            </span>
          </div>
        </div>

        {/* Scarcity message */}
        <div className="text-center">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            ⚡ Precio especial de lanzamiento - Solo por hoy
          </p>
        </div>
      </div>
    </div>
  );
};

export default UrgencyCounter;
