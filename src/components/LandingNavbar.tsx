import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
const LandingNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Evaluación", href: "/evaluacion" },
    { label: "Testimonios", href: "/#testimonios" },
    { label: "Documentación", href: "/documentacion" },
  ];

  const scrollToSection = (href: string) => {
    setIsMenuOpen(false);
    if (href.startsWith("/#")) {
      const sectionId = href.replace("/#", "");
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl sm:text-2xl font-display font-light tracking-tight">
              <span className="text-foreground">Implant</span>
              <span className="text-primary">X</span>
              <span className="text-muted-foreground/40 text-lg">™</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA + Badges */}
          <div className="hidden md:flex items-center gap-3">
            {/* SafeCreative Seal */}
            <a 
              href="/docs/SafeCreative_Certificate.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/30 hover:bg-success/20 transition-colors group"
              title="Propiedad Intelectual Registrada"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span className="text-[10px] font-medium text-success tracking-wide">SafeCreative®</span>
            </a>
            
            <a 
              href="https://humanaia.cl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
            >
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary tracking-wider">humana.ia</span>
            </a>
            <Button 
              onClick={() => navigate('/evaluacion')}
              size="sm"
              className="rounded-full"
            >
              Empezar
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border animate-fade-in">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href)}
                className="text-lg text-muted-foreground hover:text-foreground transition-colors py-2 text-left"
              >
                {link.label}
              </button>
            ))}
            
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              {/* SafeCreative Badge Mobile */}
              <a 
                href="/docs/SafeCreative_Certificate.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30"
              >
                <ShieldCheck className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">Propiedad Registrada SafeCreative®</span>
              </a>
              <a 
                href="https://humanaia.cl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
              >
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Powered by humana.ia</span>
              </a>
              <Button 
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/evaluacion');
                }}
                className="w-full rounded-full"
              >
                Empezar Evaluación
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
