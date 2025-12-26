import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";
import { toast } from "sonner";

interface EvaluationFormProps {
  onEvaluate: (evaluation: any) => void;
}

const EvaluationForm = ({ onEvaluate }: EvaluationFormProps) => {
  const [formData, setFormData] = useState({
    age: 45,
    smoking: "no",
    diabetes: "no",
    boneDensity: 75,
    implantLocation: "anterior",
    previousSurgery: "no",
    hygiene: 80,
  });

  const calculateRisk = () => {
    let riskScore = 0;
    const factors = [];

    // Age factor
    if (formData.age > 65) {
      riskScore += 15;
      factors.push({ name: "Edad", value: `${formData.age} años`, impact: 15 });
    } else if (formData.age > 50) {
      riskScore += 8;
      factors.push({ name: "Edad", value: `${formData.age} años`, impact: 8 });
    } else {
      factors.push({ name: "Edad", value: `${formData.age} años`, impact: 0 });
    }

    // Smoking
    if (formData.smoking === "yes") {
      riskScore += 25;
      factors.push({ name: "Tabaquismo", value: "Sí", impact: 25 });
    } else {
      factors.push({ name: "Tabaquismo", value: "No", impact: 0 });
    }

    // Diabetes
    if (formData.diabetes === "yes") {
      riskScore += 20;
      factors.push({ name: "Diabetes", value: "Sí", impact: 20 });
    } else {
      factors.push({ name: "Diabetes", value: "No", impact: 0 });
    }

    // Bone density
    if (formData.boneDensity < 50) {
      riskScore += 30;
      factors.push({ name: "Densidad Ósea", value: `${formData.boneDensity}%`, impact: 30 });
    } else if (formData.boneDensity < 70) {
      riskScore += 15;
      factors.push({ name: "Densidad Ósea", value: `${formData.boneDensity}%`, impact: 15 });
    } else {
      factors.push({ name: "Densidad Ósea", value: `${formData.boneDensity}%`, impact: 5 });
    }

    // Previous surgery
    if (formData.previousSurgery === "yes") {
      riskScore += 10;
      factors.push({ name: "Cirugía Previa", value: "Sí", impact: 10 });
    } else {
      factors.push({ name: "Cirugía Previa", value: "No", impact: 0 });
    }

    // Hygiene
    if (formData.hygiene < 60) {
      riskScore += 20;
      factors.push({ name: "Higiene Oral", value: `${formData.hygiene}%`, impact: 20 });
    } else if (formData.hygiene < 80) {
      riskScore += 10;
      factors.push({ name: "Higiene Oral", value: `${formData.hygiene}%`, impact: 10 });
    } else {
      factors.push({ name: "Higiene Oral", value: `${formData.hygiene}%`, impact: 0 });
    }

    const risk = riskScore < 30 
      ? { label: "Bajo", percentage: riskScore, color: "success" }
      : riskScore < 60
      ? { label: "Medio", percentage: riskScore, color: "warning" }
      : { label: "Alto", percentage: riskScore, color: "destructive" };

    const recommendations = [];
    
    if (formData.smoking === "yes") {
      recommendations.push({
        text: "Se recomienda cesación del tabaco al menos 2 semanas antes de la cirugía",
        evidence: "Bain CA, Moy PK. The association between the failure of dental implants and cigarette smoking. Int J Oral Maxillofac Implants. 1993;8(6):609-615."
      });
    }

    if (formData.boneDensity < 70) {
      recommendations.push({
        text: "Considerar injerto óseo previo al implante para mejorar la densidad",
        evidence: "Chiapasco M, et al. Bone augmentation procedures in implant dentistry. Int J Oral Maxillofac Implants. 2009;24:237-259."
      });
    }

    if (formData.diabetes === "yes") {
      recommendations.push({
        text: "Control glucémico estricto pre y post-operatorio (HbA1c < 7%)",
        evidence: "Oates TW, et al. Glycemic control and implant stabilization in type 2 diabetes mellitus. J Dent Res. 2009;88(4):367-371."
      });
    }

    if (formData.hygiene < 80) {
      recommendations.push({
        text: "Protocolo de higiene intensivo y controles periódicos cada 3 meses",
        evidence: "Heitz-Mayfield LJ, et al. Supportive peri-implant therapy following anti-infective surgical peri-implantitis treatment. Clin Oral Implants Res. 2018;29:32-44."
      });
    }

    const evaluation = {
      id: `EV-${Date.now()}`,
      date: new Date().toLocaleDateString('es-CL'),
      formData,
      risk,
      factors,
      recommendations,
      successProbability: 100 - riskScore,
    };

    onEvaluate(evaluation);
    toast.success("Evaluación completada", {
      description: `Riesgo ${risk.label} detectado. Probabilidad de éxito: ${100 - riskScore}%`
    });
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Nueva Evaluación</h2>
        <p className="text-sm text-muted-foreground">Complete los datos clínicos del paciente</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="age">Edad del Paciente</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="smoking">Tabaquismo</Label>
          <Select value={formData.smoking} onValueChange={(value) => setFormData({ ...formData, smoking: value })}>
            <SelectTrigger id="smoking">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No fumador</SelectItem>
              <SelectItem value="yes">Fumador activo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diabetes">Diabetes</Label>
          <Select value={formData.diabetes} onValueChange={(value) => setFormData({ ...formData, diabetes: value })}>
            <SelectTrigger id="diabetes">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">Sin diabetes</SelectItem>
              <SelectItem value="yes">Diabetes presente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="boneDensity">Densidad Ósea (%)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="boneDensity"
              value={[formData.boneDensity]}
              onValueChange={([value]) => setFormData({ ...formData, boneDensity: value })}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="w-12 text-right font-semibold">{formData.boneDensity}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="implantLocation">Ubicación del Implante</Label>
          <Select value={formData.implantLocation} onValueChange={(value) => setFormData({ ...formData, implantLocation: value })}>
            <SelectTrigger id="implantLocation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anterior">Sector Anterior</SelectItem>
              <SelectItem value="posterior">Sector Posterior</SelectItem>
              <SelectItem value="molar">Zona Molar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="previousSurgery">Cirugía Previa en la Zona</Label>
          <Select value={formData.previousSurgery} onValueChange={(value) => setFormData({ ...formData, previousSurgery: value })}>
            <SelectTrigger id="previousSurgery">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Sí</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hygiene">Índice de Higiene Oral (%)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="hygiene"
              value={[formData.hygiene]}
              onValueChange={([value]) => setFormData({ ...formData, hygiene: value })}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="w-12 text-right font-semibold">{formData.hygiene}%</span>
          </div>
        </div>

        <Button onClick={calculateRisk} className="w-full gap-2" size="lg">
          <Calculator className="h-5 w-5" />
          Calcular Riesgo
        </Button>
      </div>
    </Card>
  );
};

export default EvaluationForm;
