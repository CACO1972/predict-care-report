import { FileText, Award, Shield, ExternalLink, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const documents = [
  {
    title: "White Paper Clínico",
    description: "Validación científica del algoritmo ImplantX y metodología de cálculo del Índice de Riesgo Predictivo (IRP).",
    icon: FileText,
    href: "/docs/ImplantX_Clinical_Validation_White_Paper.pdf",
    category: "Investigación"
  },
  {
    title: "Certificado SafeCreative",
    description: "Certificación oficial de registro de propiedad intelectual del algoritmo ImplantX.",
    icon: Award,
    href: "/docs/SafeCreative_Certificate.pdf",
    category: "Propiedad Intelectual"
  },
  {
    title: "Inscripción SafeCreative",
    description: "Documento de inscripción y registro ante SafeCreative para protección de derechos de autor.",
    icon: Shield,
    href: "/docs/SafeCreative_Inscription.pdf",
    category: "Propiedad Intelectual"
  }
];

const Documentation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Documentación
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Accede a nuestra documentación científica, certificados de propiedad intelectual y validación clínica del algoritmo ImplantX.
            </p>
          </div>

          <div className="grid gap-6">
            {documents.map((doc) => (
              <a
                key={doc.title}
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <doc.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                        {doc.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {doc.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Documentación verificada y registrada
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-6 bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 ImplantX · Powered by{" "}
            <a 
              href="https://humanaia.cl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              humana.ia
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Documentation;
