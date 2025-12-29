import RioAvatar from "@/components/RioAvatar";
import QuestionCard from "@/components/QuestionCard";
import ImageUpload from "@/components/ImageUpload";
import { ImplantXAnswers, PurchaseLevel, QuestionnaireStep } from "@/types/questionnaire";

interface OdontogramStepProps {
  implantAnswers: Partial<ImplantXAnswers>;
  setImplantAnswers: (answers: Partial<ImplantXAnswers>) => void;
  userName?: string;
  purchaseLevel: PurchaseLevel;
  setUploadedImage: (image: string | null) => void;
  setImageAnalysis: (analysis: string | null) => void;
  setStep: (step: QuestionnaireStep) => void;
}

const OdontogramStep = ({ 
  implantAnswers, 
  setImplantAnswers, 
  userName, 
  purchaseLevel,
  setUploadedImage,
  setImageAnalysis,
  setStep
}: OdontogramStepProps) => {
  const handleImageContinue = () => {
    setStep('summary');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <RioAvatar 
        message={`${userName}, ¿en qué zona de tu boca necesitas el implante?`}
        userName={userName}
      />
      <QuestionCard
        question="¿En qué zona necesitas el implante?"
        type="radio"
        options={[
          { value: 'frontal-superior', label: 'Frontal superior' },
          { value: 'frontal-inferior', label: 'Frontal inferior' },
          { value: 'lateral-superior-derecho', label: 'Lateral superior derecho' },
          { value: 'lateral-superior-izquierdo', label: 'Lateral superior izquierdo' },
          { value: 'lateral-inferior-derecho', label: 'Lateral inferior derecho' },
          { value: 'lateral-inferior-izquierdo', label: 'Lateral inferior izquierdo' },
        ]}
        value={implantAnswers.implantZones?.[0] || ''}
        onChange={(value) => {
          setImplantAnswers({ ...implantAnswers, implantZones: [value as string] });
        }}
        onNext={() => {}}
        hideNextButton={true}
      />
      {implantAnswers.implantZones?.length > 0 && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-center">Si tienes una foto o radiografía de la zona, nuestra IA la analizará (opcional)</p>
          <ImageUpload
            onImageSelect={(file, preview, analysis) => {
              setUploadedImage(preview);
              setImageAnalysis(analysis);
            }}
            onContinue={handleImageContinue}
            showSkip={true}
            patientName={userName}
            isPremium={purchaseLevel === 'premium'}
          />
        </div>
      )}
    </div>
  );
};

export default OdontogramStep;
