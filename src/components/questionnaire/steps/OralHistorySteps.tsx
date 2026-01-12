import RioAvatar from "@/components/RioAvatar";
import QuestionCard from "@/components/QuestionCard";
import { ImplantXAnswers } from "@/types/questionnaire";

interface OralHistoryStepProps {
  implantAnswers: Partial<ImplantXAnswers>;
  setImplantAnswers: (answers: Partial<ImplantXAnswers>) => void;
  userName?: string;
  onAnswer: (questionId: string, value: string, nextStepFn: () => void) => void;
  getNextStepFunction: (step: string) => () => void;
}

export const ImplantHistoryStep = ({ implantAnswers, setImplantAnswers, userName, onAnswer, getNextStepFunction }: OralHistoryStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message="¿Te han puesto implantes antes? Esto nos ayuda a entender tu caso."
      userName={userName}
      customAudioUrl="/audio/rio-implante-pregunta.mp3"
    />
    <QuestionCard
      question="¿Has tenido implantes dentales antes?"
      type="radio"
      options={[
        { value: 'no', label: 'No, sería mi primero' },
        { value: 'success', label: 'Sí, y funcionan bien' },
        { value: 'failed', label: 'Sí, pero me fallaron' },
      ]}
      value={implantAnswers.implantHistory}
      onChange={(value) => {
        setImplantAnswers({ ...implantAnswers, implantHistory: value as any });
        onAnswer('implantHistory', value as string, getNextStepFunction('implant-history'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);

export const ToothLossStep = ({ implantAnswers, setImplantAnswers, userName, onAnswer, getNextStepFunction }: OralHistoryStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message="¿Por qué perdiste el diente? Esto nos da pistas importantes."
      userName={userName}
      customAudioUrl="/audio/rio-causa-pregunta.mp3"
    />
    <QuestionCard
      question={`¿Por qué perdiste el diente, ${userName}?`}
      type="radio"
      options={[
        { value: 'cavity', label: 'Por una carie' },
        { value: 'periodontitis', label: 'Por problemas de encías' },
        { value: 'trauma', label: 'Por un golpe' },
        { value: 'other', label: 'Otra razón' },
      ]}
      value={implantAnswers.toothLossCause}
      onChange={(value) => {
        setImplantAnswers({ ...implantAnswers, toothLossCause: value as any });
        onAnswer('toothLossCause', value as string, getNextStepFunction('tooth-loss'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);

export const ToothLossTimeStep = ({ implantAnswers, setImplantAnswers, userName, onAnswer, getNextStepFunction }: OralHistoryStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message="¿Hace cuánto perdiste el diente? El tiempo importa para el hueso."
      userName={userName}
      customAudioUrl="/audio/rio-tiempo-pregunta.mp3"
    />
    <QuestionCard
      question={`¿Hace cuánto perdiste el diente, ${userName}?`}
      type="radio"
      options={[
        { value: 'less-1', label: 'Menos de 1 año' },
        { value: '1-3', label: 'Entre 1 y 3 años' },
        { value: 'more-3', label: 'Más de 3 años' },
      ]}
      value={implantAnswers.toothLossTime}
      onChange={(value) => {
        setImplantAnswers({ ...implantAnswers, toothLossTime: value as any });
        onAnswer('toothLossTime', value as string, getNextStepFunction('tooth-loss-time'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);

export const TeethCountStep = ({ implantAnswers, setImplantAnswers, userName, onAnswer, getNextStepFunction }: OralHistoryStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message={`${userName}, ¿cuántos dientes te faltan? Esto nos ayuda a orientarte mejor.`}
      userName={userName}
      customAudioUrl="/audio/rio-cuantos-dientes.mp3"
    />
    <QuestionCard
      question="¿Cuántos dientes te faltan?"
      type="radio"
      options={[
        { value: '1-2', label: '1 o 2 dientes' },
        { value: '3-8', label: '3 a 8 dientes' },
        { value: 'all', label: 'Todos los dientes' },
      ]}
      value={implantAnswers.teethToReplace}
      onChange={(value) => {
        setImplantAnswers({ ...implantAnswers, teethToReplace: value as any });
        onAnswer('teethCount', value as string, getNextStepFunction('teeth-count'));
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
  </div>
);
