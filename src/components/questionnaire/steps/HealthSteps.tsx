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
      message={`Gracias, ${userName}. Ahora unas preguntas sobre tu salud. Sé honesto, es para ayudarte mejor.`}
      userName={userName}
      customAudioUrl="/audio/rio-fuma.mp3"
    />
    <QuestionCard
      question="¿Fumas?"
      type="radio"
      options={[
        { value: 'no', label: 'No' },
        { value: 'less-10', label: 'Sí, poco (menos de 10 al día)' },
        { value: '10-plus', label: 'Sí, harto (10 o más al día)' },
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
      message="Algunas personas aprietan los dientes sin darse cuenta, sobre todo al dormir."
      userName={userName}
      customAudioUrl="/audio/rio-brux-pregunta.mp3"
    />
    <QuestionCard
      question={`¿Aprietas o rechinas los dientes, ${userName}?`}
      type="radio"
      options={[
        { value: 'no', label: 'No' },
        { value: 'unsure', label: 'No sé' },
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
      message="Si aprietas los dientes, una placa de noche puede ayudar a cuidar tus implantes."
      userName={userName}
    />
    <QuestionCard
      question={`¿Usas una placa de noche, ${userName}?`}
      type="radio"
      options={[
        { value: 'no', label: 'No uso' },
        { value: 'yes', label: 'Sí uso' },
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
      message="Tu salud en general también importa para los implantes."
      userName={userName}
      customAudioUrl="/audio/rio-diabetes-pregunta.mp3"
    />
    <QuestionCard
      question="¿Tienes diabetes o azúcar alta?"
      type="radio"
      options={[
        { value: 'no', label: 'No' },
        { value: 'controlled', label: 'Sí, pero la controlo' },
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
