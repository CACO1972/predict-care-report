import { HelpCircle, Mail, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HelpButtonProps {
  email?: string;
  subject?: string;
}

const HelpButton = ({ 
  email = "soporte@implantx.cl",
  subject = "Necesito ayuda con mi evaluación ImplantX"
}: HelpButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmailClick = () => {
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    window.location.href = mailtoLink;
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popup */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-card border border-border rounded-2xl shadow-2xl p-4 animate-fade-in">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-primary" />
              </div>
              <p className="font-semibold text-foreground">¿Necesitas ayuda?</p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Estamos aquí para resolver tus dudas sobre la evaluación.
            </p>
            
            <button
              onClick={handleEmailClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors"
            >
              <Mail className="w-4 h-4" />
              Enviar email
            </button>
            
            <p className="text-xs text-center text-muted-foreground">
              {email}
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200",
          isOpen 
            ? "bg-muted hover:bg-muted/80" 
            : "bg-primary hover:bg-primary/90"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <HelpCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </button>
    </div>
  );
};

export default HelpButton;
