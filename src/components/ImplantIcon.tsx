import { cn } from "@/lib/utils";
import implantImage from "@/assets/implant-icon.png";

interface ImplantIconProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const ImplantIcon = ({ className, size = "md" }: ImplantIconProps) => {
  return (
    <img
      src={implantImage}
      alt="Implante dental"
      className={cn(sizeClasses[size], "object-contain", className)}
    />
  );
};

export default ImplantIcon;