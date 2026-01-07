import { Button } from "@/components/ui/button";
import RioAvatar from "@/components/RioAvatar";
import QuestionCard from "@/components/QuestionCard";
import { DensityProAnswers } from "@/types/questionnaire";
import { Sparkles } from "lucide-react";

interface DensityIntroStepProps {
  userName?: string;
  onNext: () => void;
}

export const DensityIntroStep = ({ userName, onNext }: DensityIntroStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message={`Hola {name}, he notado por tu edad y género que es importante evaluar tu salud ósea. Estas preguntas nos ayudarán a entender la calidad de tus huesos.`}
      userName={userName}
    />
    <Button 
      onClick={onNext} 
      size="lg" 
      className="w-full h-12 text-base font-medium rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all"
    >
      Comenzar Evaluación Ósea
    </Button>
  </div>
);

interface DensityQuestionProps {
  densityAnswers: Partial<DensityProAnswers>;
  setDensityAnswers: (answers: Partial<DensityProAnswers>) => void;
  userName?: string;
  onAnswer: (questionId: string, value: string, nextStepFn: () => void) => void;
  getNextStepFunction: (step: string) => () => void;
}

export const DensityQ1Step = ({ densityAnswers, setDensityAnswers, userName, onAnswer, getNextStepFunction }: DensityQuestionProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message="Comencemos con tu historial médico." 
      userName={userName}
    />
    <QuestionCard
      question="¿Alguna vez has tenido una fractura de hueso (ej. muñeca, cadera, columna) después de una caída o golpe menor como adulto?"
      type="radio"
      options={[
        { value: 'no', label: 'No' },
        { value: 'once', label: 'Sí, una vez' },
        { value: 'multiple', label: 'Sí, más de una vez' },
      ]}
      value={densityAnswers.fractures}
      onChange={(value) => {
        setDensityAnswers({ ...densityAnswers, fractures: value as any });
        onAnswer('fractures', value as string, getNextStepFunction('density-q1'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);

export const DensityQ2Step = ({ densityAnswers, setDensityAnswers, userName, onAnswer, getNextStepFunction }: DensityQuestionProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message="Ahora, sobre algunos cambios que quizás hayas notado." 
      userName={userName}
    />
    <QuestionCard
      question="¿Has notado una disminución en tu estatura en los últimos años?"
      type="radio"
      options={[
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Sí, he perdido un poco de altura' },
        { value: 'unsure', label: 'No estoy seguro/a' },
      ]}
      value={densityAnswers.heightLoss}
      onChange={(value) => {
        setDensityAnswers({ ...densityAnswers, heightLoss: value as any });
        onAnswer('heightLoss', value as string, getNextStepFunction('density-q2'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);

export const DensityQ3Step = ({ densityAnswers, setDensityAnswers, userName, onAnswer, getNextStepFunction }: DensityQuestionProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message="La genética también juega un papel importante." 
      userName={userName}
      customAudioUrl="/audio/rio-density-q3.mp3"
    />
    <QuestionCard
      question="¿Alguno de tus padres fue diagnosticado con osteoporosis o sufrió una fractura de cadera después de una caída leve?"
      type="radio"
      options={[
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Sí' },
        { value: 'unknown', label: 'No lo sé' },
      ]}
      value={densityAnswers.familyHistory}
      onChange={(value) => {
        setDensityAnswers({ ...densityAnswers, familyHistory: value as any });
        onAnswer('familyHistory', value as string, getNextStepFunction('density-q3'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);

export const DensityQ4Step = ({ densityAnswers, setDensityAnswers, userName, onAnswer, getNextStepFunction }: DensityQuestionProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message="Ciertos medicamentos pueden afectar la salud de los huesos." 
      userName={userName}
    />
    <QuestionCard
      question="¿Has tomado o tomas actualmente medicamentos corticoides (como prednisona o cortisona) de forma regular por más de 3 meses?"
      type="radio"
      options={[
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Sí' },
        { value: 'unsure', label: 'No estoy seguro/a' },
      ]}
      value={densityAnswers.corticosteroids}
      onChange={(value) => {
        setDensityAnswers({ ...densityAnswers, corticosteroids: value as any });
        onAnswer('corticosteroids', value as string, getNextStepFunction('density-q4'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);

export const DensityQ5Step = ({ densityAnswers, setDensityAnswers, userName, onAnswer, getNextStepFunction }: DensityQuestionProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message="Finalmente, algunos hábitos de vida." 
      userName={userName}
    />
    <QuestionCard
      question="¿Consumes más de dos bebidas alcohólicas al día de forma habitual?"
      type="radio"
      options={[
        { value: 'no', label: 'No' },
        { value: 'yes', label: 'Sí' },
      ]}
      value={densityAnswers.alcohol}
      onChange={(value) => {
        setDensityAnswers({ ...densityAnswers, alcohol: value as any });
        onAnswer('alcohol', value as string, getNextStepFunction('density-q5'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);

interface DensityCompleteStepProps {
  userName?: string;
  onNext: () => void;
}

export const DensityCompleteStep = ({ userName, onNext }: DensityCompleteStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <div className="text-center p-8 bg-background border border-border rounded-2xl shadow-sm">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Sección Completada</h3>
      <p className="text-muted-foreground">Evaluación ósea finalizada</p>
    </div>
    <RioAvatar 
      message="¡Gracias, {name}! He analizado tus respuestas. Continuemos con el cuestionario principal."
      userName={userName}
    />
    <Button 
      onClick={onNext} 
      size="lg" 
      className="w-full h-12 text-base font-medium rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all"
    >
      Continuar →
    </Button>
  </div>
);
