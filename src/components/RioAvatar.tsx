import { cn } from "@/lib/utils";
import RioAvatarExpressive from "./RioAvatarExpressive";
import { RioExpression } from "@/hooks/useRioExpression";

interface RioAvatarProps {
  message: string;
  userName?: string;
  expression?: RioExpression;
  className?: string;
}

const RioAvatar = ({ message, userName, expression = 'encouraging', className }: RioAvatarProps) => {
  // Replace {name} placeholder with actual user name
  const processedMessage = userName ? message.replace(/{name}/g, userName) : message;

  return (
    <div className={cn("flex gap-4 sm:gap-5 items-start animate-fade-in", className)}>
      {/* Avatar with 3D dentist */}
      <RioAvatarExpressive 
        expression={expression}
        size="lg"
      />
      
      {/* Message bubble */}
      <div className="flex-1 relative bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm p-5 sm:p-6 shadow-sm">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="relative">
          <p className="text-sm font-bold text-primary mb-2 flex items-center gap-2 font-display">
            Río
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
          </p>
          <p className="text-foreground leading-relaxed text-base">{processedMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default RioAvatar;
