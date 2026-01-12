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
      message="Veamos ahora la salud de tus encías."
      userName={userName}
      customAudioUrl="/audio/rio-pregunta-encias.mp3"
    />
    <QuestionCard
      question="1. ¿Sangran cuando te cepillas los dientes?"
      type="radio"
      options={[
        { value: 'never', label: 'Nunca o casi nunca' },
        { value: 'sometimes', label: 'A veces' },
        { value: 'frequently', label: 'Frecuentemente' },
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
        question="2. ¿Has perdido algún diente porque se movía o se 'soltó' solo, sin causa aparente como un golpe o caries grande?"
        type="radio"
        options={[
          { value: 'no', label: 'No' },
          { value: '1-2', label: 'Sí, 1 o 2 dientes' },
          { value: 'several', label: 'Sí, varios dientes' },
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
        question="3. ¿Cuántas veces al día te cepillas los dientes?"
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
