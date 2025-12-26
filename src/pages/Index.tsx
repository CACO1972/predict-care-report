import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, FileText, TrendingUp, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import EvaluationForm from "@/components/EvaluationForm";
import RiskAssessment from "@/components/RiskAssessment";
import ReportPreview from "@/components/ReportPreview";
import logoMiro from "@/assets/logo-miro-largo-blanco.png";

const Index = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "new-evaluation">("dashboard");
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null);

  const stats = [
    { label: "Evaluaciones Totales", value: "247", icon: Activity, trend: "+12%", color: "primary" },
    { label: "Tasa de Éxito", value: "94.3%", icon: TrendingUp, trend: "+2.1%", color: "success" },
    { label: "En Revisión", value: "8", icon: FileText, trend: "-3", color: "warning" },
    { label: "Alto Riesgo", value: "5", icon: AlertCircle, trend: "+1", color: "destructive" },
  ];

  const recentEvaluations = [
    { id: "EV-2024-001", patient: "Paciente Anónimo", date: "24/11/2024", risk: "Bajo", success: 96 },
    { id: "EV-2024-002", patient: "Paciente Anónimo", date: "23/11/2024", risk: "Medio", success: 78 },
    { id: "EV-2024-003", patient: "Paciente Anónimo", date: "23/11/2024", risk: "Bajo", success: 92 },
    { id: "EV-2024-004", patient: "Paciente Anónimo", date: "22/11/2024", risk: "Alto", success: 45 },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Bajo": return "success";
      case "Medio": return "warning";
      case "Alto": return "destructive";
      default: return "muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">ImplantX</h1>
                <p className="text-sm text-muted-foreground">Sistema Predictivo Implantológico</p>
              </div>
            </div>
            <div className="flex items-center">
              <img src={logoMiro} alt="Clínica Miró" className="h-8" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="mb-8 flex gap-4">
          <Button
            variant={activeView === "dashboard" ? "default" : "outline"}
            onClick={() => setActiveView("dashboard")}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeView === "new-evaluation" ? "default" : "outline"}
            onClick={() => setActiveView("new-evaluation")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Evaluación
          </Button>
        </div>

        {activeView === "dashboard" ? (
          <>
            {/* Stats Grid */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                      <p className={`mt-1 text-sm text-${stat.color}`}>{stat.trend}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${stat.color}/10`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent Evaluations */}
            <Card className="overflow-hidden">
              <div className="border-b bg-muted/30 p-6">
                <h2 className="text-xl font-semibold">Evaluaciones Recientes</h2>
                <p className="text-sm text-muted-foreground">Últimas evaluaciones realizadas en el sistema</p>
              </div>
              <div className="divide-y">
                {recentEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between p-6 transition-colors hover:bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-${getRiskColor(evaluation.risk)}/10`}>
                        {evaluation.risk === "Bajo" ? (
                          <CheckCircle2 className={`h-5 w-5 text-${getRiskColor(evaluation.risk)}`} />
                        ) : (
                          <AlertCircle className={`h-5 w-5 text-${getRiskColor(evaluation.risk)}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{evaluation.id}</p>
                        <p className="text-sm text-muted-foreground">{evaluation.patient}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{evaluation.date}</p>
                        <Badge variant={getRiskColor(evaluation.risk) as any} className="mt-1">
                          {evaluation.risk}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{evaluation.success}%</p>
                        <p className="text-xs text-muted-foreground">Éxito</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <EvaluationForm onEvaluate={setCurrentEvaluation} />
            </div>
            <div className="space-y-8">
              {currentEvaluation && (
                <>
                  <RiskAssessment evaluation={currentEvaluation} />
                  <ReportPreview evaluation={currentEvaluation} />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <a 
              href="https://www.safecreative.org/work/2510073245348" 
              target="_blank" 
              rel="noopener noreferrer cc:license"
              className="transition-opacity hover:opacity-80"
            >
              <img 
                src="https://resources.safecreative.org/work/2510073245348/label/standard-300" 
                alt="Safe Creative #2510073245348" 
                className="h-16"
              />
            </a>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Aplicación con Propiedad Intelectual y Patent Pending
              </p>
              <p className="text-xs text-muted-foreground">
                Registrada a nombre de <span className="font-semibold">Dr. Carlos Montoya</span> y <span className="font-semibold">Clínica Miró</span>
              </p>
              <p className="text-xs text-muted-foreground">
                © 2024 ImplantX. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
