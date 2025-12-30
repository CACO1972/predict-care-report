import RioAvatar from "@/components/RioAvatar";
import QuestionCard from "@/components/QuestionCard";
import { UserProfile } from "@/types/questionnaire";

interface NameStepProps {
  userProfile: Partial<UserProfile>;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  onNext: () => void;
}

export const NameStep = ({ userProfile, setUserProfile, onNext }: NameStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar message="Para empezar, por favor dime tu nombre." customAudioUrl="/audio/rio-nombre.mp3" />
    <QuestionCard
      question="¿Cuál es tu nombre?"
      type="text"
      value={userProfile.name}
      onChange={(value) => setUserProfile({ ...userProfile, name: value as string })}
      onNext={onNext}
      nextButtonText="Continuar"
      hideNextButton={false}
    />
  </div>
);

interface DemographicsStepProps {
  userProfile: Partial<UserProfile>;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  onNext: (gender?: 'male' | 'female' | 'other') => void;
}

export const DemographicsStep = ({ userProfile, setUserProfile, onNext }: DemographicsStepProps) => (
  <div className="space-y-6 animate-fade-in">
    <RioAvatar 
      message={`¡Un gusto, ${userProfile.name}! Ahora necesito algunos datos básicos para personalizar tu evaluación.`}
      userName={userProfile.name}
      customAudioUrl="/audio/rio-edad.mp3"
    />
    <QuestionCard
      question="¿Cuál es tu edad?"
      type="number"
      value={userProfile.age}
      onChange={(value) => setUserProfile({ ...userProfile, age: value as number })}
      onNext={() => {}}
      hideNextButton={true}
      disabled={!userProfile.age}
    />
    {userProfile.age && (
      <QuestionCard
        question="¿Cuál es tu género?"
        type="gender"
        value={userProfile.gender}
        onChange={(value) => {
          const gender = value as 'male' | 'female' | 'other';
          setUserProfile({ ...userProfile, gender });
          setTimeout(() => onNext(gender), 500);
        }}
        onNext={() => {}}
        hideNextButton={true}
      />
    )}
  </div>
);
