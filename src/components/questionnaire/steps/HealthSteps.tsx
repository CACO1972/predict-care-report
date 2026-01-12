import RioAvatar from "@/components/RioAvatar";
import QuestionCard from "@/components/QuestionCard";
import { ImplantXAnswers } from "@/types/questionnaire";

interface HealthStepProps {
  implantAnswers: Partial<ImplantXAnswers>;
  setImplantAnswers: (answers: Partial<ImplantXAnswers>) => void;
  userName?: string;
  onAnswer: (questionId: string, value: string, nextStepFn: () => void) => void;
  getNextStepFunction: (step: string) => () => void;
}

export const SmokingStep = ({ implantAnswers, setImplantAnswers, userName, onAnswer, getNextStepFunction }: HealthStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message={`Perfecto, ${userName}. Hablemos ahora de algunos hábitos. Tu honestidad es clave para darte el mejor tratamiento posible.`}
      userName={userName}
      customAudioUrl="/audio/rio-fuma.mp3"
    />
    <QuestionCard
      question="¿Fumas actualmente?"
      type="radio"
      options={[
        { value: 'no', label: 'No' },
        { value: 'less-10', label: 'Sí, menos de 10 cigarrillos al día' },
        { value: '10-plus', label: 'Sí, 10 o más cigarrillos al día' },
      ]}
      value={implantAnswers.smoking}
      onChange={(value) => {
        setImplantAnswers({ ...implantAnswers, smoking: value as any });
        onAnswer('smoking', value as string, getNextStepFunction('smoking'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);

export const BruxismStep = ({ implantAnswers, setImplantAnswers, userName, onAnswer, getNextStepFunction }: HealthStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message="Algunas personas aprietan los dientes, a menudo sin darse cuenta. Es más común de lo que piensas."
      userName={userName}
      customAudioUrl="/audio/rio-brux-pregunta.mp3"
    />
    <QuestionCard
      question={`¿Aprietas o rechinas los dientes, ${userName}?`}
      type="radio"
      options={[
        { value: 'no', label: 'No' },
        { value: 'unsure', label: 'No estoy seguro/a' },
        { value: 'yes', label: 'Sí' },
      ]}
      value={implantAnswers.bruxism}
      onChange={(value) => {
        setImplantAnswers({ ...implantAnswers, bruxism: value as any });
        onAnswer('bruxism', value as string, getNextStepFunction('bruxism'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);

export const BruxismGuardStep = ({ implantAnswers, setImplantAnswers, userName, onAnswer, getNextStepFunction }: HealthStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message="El bruxismo puede manejarse muy bien. Una férula de descarga protege tanto tus dientes naturales como los implantes."
      userName={userName}
    />
    <QuestionCard
      question={`${userName}, ¿usas una férula de descarga nocturna?`}
      type="radio"
      options={[
        { value: 'no', label: 'No, no uso férula' },
        { value: 'yes', label: 'Sí, uso férula de descarga' },
      ]}
      value={implantAnswers.bruxismGuard}
      onChange={(value) => {
        setImplantAnswers({ ...implantAnswers, bruxismGuard: value as any });
        onAnswer('bruxismGuard', value as string, getNextStepFunction('bruxism-guard'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);

export const DiabetesStep = ({ implantAnswers, setImplantAnswers, userName, onAnswer, getNextStepFunction }: HealthStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message="Tu salud general influye mucho en el éxito del tratamiento."
      userName={userName}
      customAudioUrl="/audio/rio-diabetes-pregunta.mp3"
    />
    <QuestionCard
      question="¿Tienes diabetes?"
      type="radio"
      options={[
        { value: 'no', label: 'No' },
        { value: 'controlled', label: 'Sí, y está controlada' },
        { value: 'uncontrolled', label: 'Sí, y no está bien controlada' },
      ]}
      value={implantAnswers.diabetes}
      onChange={(value) => {
        setImplantAnswers({ ...implantAnswers, diabetes: value as any });
        onAnswer('diabetes', value as string, getNextStepFunction('diabetes'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);
