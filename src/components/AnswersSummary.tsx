import { UserProfile, DensityProAnswers, ImplantXAnswers } from "@/types/questionnaire";
import { Button } from "@/components/ui/button";
import { Check, Edit2, ChevronRight } from "lucide-react";
import RioAvatar from "./RioAvatar";

interface AnswersSummaryProps {
  userProfile: Partial<UserProfile>;
  densityAnswers: Partial<DensityProAnswers>;
  implantAnswers: Partial<ImplantXAnswers>;
  requiresDensityPro: boolean;
  uploadedImage: string | null;
  onConfirm: () => void;
  onEdit: () => void;
}

const getAnswerLabel = (questionId: string, value: string | undefined): string => {
  if (!value) return 'No respondida';
  
  const labelMaps: Record<string, Record<string, string>> = {
    fractures: { no: 'No', once: 'Sí, una vez', multiple: 'Sí, más de una vez' },
    heightLoss: { no: 'No', yes: 'Sí', unsure: 'No estoy seguro/a' },
    familyHistory: { no: 'No', yes: 'Sí', unknown: 'No lo sé' },
    corticosteroids: { no: 'No', yes: 'Sí', unsure: 'No estoy seguro/a' },
    alcohol: { no: 'No', yes: 'Sí' },
    smoking: { no: 'No fumo', 'less-10': 'Menos de 10/día', '10-plus': '10 o más/día' },
    bruxism: { no: 'No', unsure: 'No estoy seguro/a', yes: 'Sí' },
    diabetes: { no: 'No', controlled: 'Sí, controlada', uncontrolled: 'Sí, no controlada' },
    implantHistory: { no: 'Primer implante', success: 'Sí, exitosos', failed: 'Sí, fracasaron' },
    toothLossCause: { cavity: 'Caries', periodontitis: 'Periodontitis', trauma: 'Trauma', other: 'Otra razón' },
    toothLossTime: { 'less-1': 'Menos de 1 año', '1-3': '1-3 años', 'more-3': 'Más de 3 años' },
    gumBleeding: { never: 'Nunca', sometimes: 'A veces', frequently: 'Frecuentemente' },
    oralHygiene: { 'less-once': 'Menos de 1 vez', once: '1 vez', 'twice-plus': '2+ veces' },
    gender: { male: 'Masculino', female: 'Femenino', other: 'Otro' },
  };
  return labelMaps[questionId]?.[value] || value;
};

interface SummaryItemProps {
  label: string;
  value: string;
}

const SummaryItem = ({ label, value }: SummaryItemProps) => (
  <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

const AnswersSummary = ({
  userProfile,
  densityAnswers,
  implantAnswers,
  requiresDensityPro,
  uploadedImage,
  onConfirm,
  onEdit,
}: AnswersSummaryProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <RioAvatar 
        message={`${userProfile.name}, antes de generar tu reporte, revisa que tus respuestas sean correctas.`}
        userName={userProfile.name}
      />
      
      <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-muted/50 px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Resumen de tu Evaluación
          </h3>
        </div>
        
        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Datos Personales */}
          <div>
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Datos Personales</h4>
            <div className="bg-muted/30 rounded-lg p-3">
              <SummaryItem label="Nombre" value={userProfile.name || ''} />
              <SummaryItem label="Edad" value={`${userProfile.age} años`} />
              <SummaryItem label="Género" value={getAnswerLabel('gender', userProfile.gender)} />
            </div>
          </div>

          {/* Evaluación Ósea */}
          {requiresDensityPro && (
            <div>
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Evaluación Ósea</h4>
              <div className="bg-muted/30 rounded-lg p-3">
                <SummaryItem label="Fracturas previas" value={getAnswerLabel('fractures', densityAnswers.fractures)} />
                <SummaryItem label="Pérdida de altura" value={getAnswerLabel('heightLoss', densityAnswers.heightLoss)} />
                <SummaryItem label="Historia familiar" value={getAnswerLabel('familyHistory', densityAnswers.familyHistory)} />
                <SummaryItem label="Corticoides" value={getAnswerLabel('corticosteroids', densityAnswers.corticosteroids)} />
                <SummaryItem label="Consumo alcohol" value={getAnswerLabel('alcohol', densityAnswers.alcohol)} />
              </div>
            </div>
          )}

          {/* Hábitos y Salud */}
          <div>
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Hábitos y Salud</h4>
            <div className="bg-muted/30 rounded-lg p-3">
              <SummaryItem label="Tabaquismo" value={getAnswerLabel('smoking', implantAnswers.smoking)} />
              <SummaryItem label="Bruxismo" value={getAnswerLabel('bruxism', implantAnswers.bruxism)} />
              <SummaryItem label="Diabetes" value={getAnswerLabel('diabetes', implantAnswers.diabetes)} />
            </div>
          </div>

          {/* Salud Oral */}
          <div>
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Salud Oral</h4>
            <div className="bg-muted/30 rounded-lg p-3">
              <SummaryItem label="Implantes previos" value={getAnswerLabel('implantHistory', implantAnswers.implantHistory)} />
              <SummaryItem label="Causa pérdida dental" value={getAnswerLabel('toothLossCause', implantAnswers.toothLossCause)} />
              <SummaryItem label="Tiempo desde pérdida" value={getAnswerLabel('toothLossTime', implantAnswers.toothLossTime)} />
              <SummaryItem label="Sangrado encías" value={getAnswerLabel('gumBleeding', implantAnswers.gumBleeding)} />
              <SummaryItem label="Higiene diaria" value={getAnswerLabel('oralHygiene', implantAnswers.oralHygiene)} />
            </div>
          </div>

          {/* Imagen */}
          {uploadedImage && (
            <div>
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Imagen Adjunta</h4>
              <div className="bg-muted/30 rounded-lg p-3">
                <img 
                  src={uploadedImage} 
                  alt="Imagen dental adjunta" 
                  className="w-full max-w-[200px] rounded-lg border border-border"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onEdit}
          variant="outline"
          size="lg" 
          className="flex-1 h-12 text-base font-medium rounded-xl border-border hover:bg-muted/50"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Editar Respuestas
        </Button>
        <Button 
          onClick={onConfirm}
          size="lg" 
          className="flex-1 h-12 text-base font-medium rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all"
        >
          Confirmar y Generar Reporte
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default AnswersSummary;
