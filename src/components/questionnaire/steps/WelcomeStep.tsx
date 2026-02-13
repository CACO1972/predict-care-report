import { RefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Award, Volume2, VolumeX } from "lucide-react";
import rioThumbnail from "@/assets/rio-video-thumbnail.png";

const RIO_VIDEOS = [
  '/video/rio-avatar-1.mp4',
  '/video/rio-avatar-2.mp4',
  '/video/rio-avatar-3.mp4',
];

interface WelcomeStepProps {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  welcomeVideoRef: RefObject<HTMLVideoElement>;
  onContinue: () => void;
}

const WelcomeStep = ({ isMuted, setIsMuted, welcomeVideoRef, onContinue }: WelcomeStepProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const comenzamosAudioRef = useRef<HTMLAudioElement | null>(null);
  const isMutedRef = useRef(isMuted);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleVideoEnded = () => {
    if (currentVideoIndex < RIO_VIDEOS.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    }
    // Last video: stays on last frame (no loop)
  };

  // Auto-play when video source changes
  useEffect(() => {
    if (welcomeVideoRef.current) {
      welcomeVideoRef.current.load();
      welcomeVideoRef.current.play().catch(() => {});
    }
  }, [currentVideoIndex]);

  // Keep muted ref in sync
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Play welcome audio sequence when component mounts
  useEffect(() => {
    const welcomeAudio = new Audio("/audio/hola-soy-rio.mp3");
    audioRef.current = welcomeAudio;
    
    // Generate comenzamos audio via TTS
    const fetchComenzamosAudio = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
            },
            body: JSON.stringify({
              text: "¿Comenzamos?",
              voice_id: "0cheeVA5B3Cv6DGq65cT"
            })
          }
        );
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          comenzamosAudioRef.current = new Audio(audioUrl);
        }
      } catch (err) {
        console.log("Failed to fetch comenzamos audio:", err);
      }
    };
    
    fetchComenzamosAudio();
    
    // Chain audios: play "comenzamos?" after welcome audio ends
    welcomeAudio.addEventListener('ended', () => {
      if (!isMutedRef.current && comenzamosAudioRef.current) {
        comenzamosAudioRef.current.play().catch(err => {
          console.log("Comenzamos audio play blocked:", err);
        });
      }
    });

    if (!isMuted) {
      welcomeAudio.play().catch(err => {
        console.log("Audio autoplay blocked:", err);
      });
    }

    return () => {
      welcomeAudio.pause();
      welcomeAudio.src = "";
      if (comenzamosAudioRef.current) {
        comenzamosAudioRef.current.pause();
        comenzamosAudioRef.current.src = "";
      }
    };
  }, []);

  // Handle mute toggle for audio
  useEffect(() => {
    if (isMuted) {
      audioRef.current?.pause();
      comenzamosAudioRef.current?.pause();
    } else {
      // Resume welcome audio if it hasn't ended
      if (audioRef.current && audioRef.current.currentTime < audioRef.current.duration) {
        audioRef.current.play().catch(err => {
          console.log("Audio play blocked:", err);
        });
      }
    }
  }, [isMuted]);

  return (
    <div className="space-y-8 animate-fade-in text-center">
      <div className="relative bg-gradient-to-b from-card to-card/80 border border-primary/20 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="relative w-full max-w-sm mx-auto mb-6">
          <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-xl shadow-primary/10 bg-background aspect-[9/16]">
            <video
              ref={welcomeVideoRef}
              src={RIO_VIDEOS[currentVideoIndex]}
              poster={rioThumbnail}
              autoPlay
              playsInline
              preload="metadata"
              muted
              onEnded={handleVideoEnded}
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            <button
              onClick={() => {
                setIsMuted(!isMuted);
              }}
              className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-foreground/70" />
              ) : (
                <Volume2 className="w-5 h-5 text-primary" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-background/50 border border-border/50 rounded-2xl">
          <p className="text-sm text-muted-foreground mb-4">
            Al continuar, acepto que mis datos serán procesados de forma anónima y segura para generar mi evaluación personalizada.
          </p>
          <Button
            onClick={onContinue}
            className="w-full h-14 text-base font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
          >
            <Shield className="w-5 h-5 mr-2" />
            Acepto y Continúo
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">100% Privado</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">5 minutos</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Award className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">Reporte PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
