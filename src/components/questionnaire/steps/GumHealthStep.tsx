import RioAvatar from "@/components/RioAvatar";
import QuestionCard from "@/components/QuestionCard";
import { ImplantXAnswers, QuestionnaireStep } from "@/types/questionnaire";

interface GumHealthStepProps {
  implantAnswers: Partial<ImplantXAnswers>;
  setImplantAnswers: (answers: Partial<ImplantXAnswers>) => void;
  userName?: string;
  setStep: (step: QuestionnaireStep) => void;
}

const GumHealthStep = ({ implantAnswers, setImplantAnswers, userName, setStep }: GumHealthStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message="Ahora veamos cómo están tus encías."
      userName={userName}
      customAudioUrl="/audio/rio-pregunta-encias.mp3"
    />
    <QuestionCard
      question="1. ¿Te sangran las encías cuando te lavas los dientes?"
      type="radio"
      options={[
        { value: 'never', label: 'Nunca o casi nunca' },
        { value: 'sometimes', label: 'A veces' },
        { value: 'frequently', label: 'Seguido' },
      ]}
      value={implantAnswers.gumBleeding}
      onChange={(value) => {
        setImplantAnswers({ ...implantAnswers, gumBleeding: value as any });
      }}
      onNext={() => {}}
      hideNextButton={true}
    />
    {implantAnswers.gumBleeding && (
      <QuestionCard
        question="2. ¿Tienes dientes sueltos o se te ha caído alguno solo?"
        type="radio"
        options={[
          { value: 'no', label: 'No' },
          { value: '1-2', label: 'Sí, 1 o 2' },
          { value: 'several', label: 'Sí, varios' },
        ]}
        value={implantAnswers.looseTeethLoss}
        onChange={(value) => {
          setImplantAnswers({ ...implantAnswers, looseTeethLoss: value as any });
        }}
        onNext={() => {}}
        hideNextButton={true}
      />
    )}
    {implantAnswers.looseTeethLoss && (
      <QuestionCard
        question="3. ¿Cuántas veces al día te lavas los dientes?"
        type="radio"
        options={[
          { value: 'less-once', label: 'Menos de una vez' },
          { value: 'once', label: 'Una vez' },
          { value: 'twice-plus', label: 'Dos o más veces' },
        ]}
        value={implantAnswers.oralHygiene}
        onChange={(value) => {
          setImplantAnswers({ ...implantAnswers, oralHygiene: value as any });
          setStep('irp-processing');
        }}
        onNext={() => {}}
        hideNextButton={true}
      />
    )}
  </div>
);

export default GumHealthStep;
