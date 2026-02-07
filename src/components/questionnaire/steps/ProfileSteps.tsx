import { useRef, useEffect, useState } from "react";
import RioAvatar from "@/components/RioAvatar";
import QuestionCard from "@/components/QuestionCard";
import { UserProfile } from "@/types/questionnaire";

const NAME_VIDEOS = [
  "/video/rio-name-1.mp4",
  "/video/rio-name-2.mp4",
  "/video/rio-name-3.mp4",
  "/video/rio-name-4.mp4",
];

interface NameStepProps {
  userProfile: Partial<UserProfile>;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  onNext: () => void;
}

export const NameStep = ({ userProfile, setUserProfile, onNext }: NameStepProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Play audio on mount
  useEffect(() => {
    const audio = new Audio("/audio/rio-nombre.mp3");
    audioRef.current = audio;
    audio.play().catch(err => console.log("Audio autoplay blocked:", err));

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Handle video sequence
  const handleVideoEnded = () => {
    if (currentVideoIndex < NAME_VIDEOS.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    } else {
      // Loop back to first video
      setCurrentVideoIndex(0);
    }
  };

  // Auto-play when video source changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log("Video autoplay blocked:", err));
    }
  }, [currentVideoIndex]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-4 sm:gap-5 items-start">
        {/* Video Avatar */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full blur-xl bg-primary/30" style={{ transform: 'scale(1.3)' }} />
          <div className="relative w-40 h-40 rounded-full overflow-hidden bg-background shadow-lg ring-[3px] ring-primary/60">
            <video
              ref={videoRef}
              src={NAME_VIDEOS[currentVideoIndex]}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background shadow-sm bg-primary flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </div>
        </div>
        
        {/* Message bubble */}
        <div className="flex-1 relative bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm p-5 sm:p-6 shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="relative">
            <p className="text-sm font-bold text-primary flex items-center gap-2 font-display mb-2">
              Río
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            </p>
            <p className="text-foreground leading-relaxed text-base">Para empezar, por favor dime tu nombre.</p>
          </div>
        </div>
      </div>

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
};

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
