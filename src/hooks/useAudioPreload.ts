import { useEffect, useRef } from 'react';

// All audio files used in the questionnaire
const QUESTIONNAIRE_AUDIO_FILES = [
  '/audio/rio-nombre.mp3',
  '/audio/rio-edad.mp3',
  '/audio/rio-fuma.mp3',
  '/audio/rio-brux-pregunta.mp3',
  '/audio/rio-diabetes-pregunta.mp3',
  '/audio/rio-pregunta-encias.mp3',
  '/audio/rio-implante-pregunta.mp3',
  '/audio/rio-causa-pregunta.mp3',
  '/audio/rio-tiempo-pregunta.mp3',
  '/audio/rio-cuantos-dientes.mp3',
  '/audio/rio-density-q3.mp3',
  '/audio/rio-resultados-intro.mp3',
  '/audio/rio-feedback-encias.mp3',
  '/audio/rio-feedback-1a2.mp3',
  '/audio/rio-feedback-puente.mp3',
  '/audio/rio-feedback-todos.mp3',
  '/audio/rio-plan-gratis.mp3',
  '/audio/rio-plan-accion.mp3',
  '/audio/rio-plan-premium.mp3',
];

// Audio cache to store preloaded audio elements
const audioCache = new Map<string, HTMLAudioElement>();

export const preloadAudio = (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    // Return cached audio if available
    if (audioCache.has(url)) {
      resolve(audioCache.get(url)!);
      return;
    }

    const audio = new Audio();
    audio.preload = 'auto';
    
    audio.oncanplaythrough = () => {
      audioCache.set(url, audio);
      resolve(audio);
    };
    
    audio.onerror = () => {
      reject(new Error(`Failed to load audio: ${url}`));
    };
    
    audio.src = url;
    audio.load();
  });
};

export const getCachedAudio = (url: string): HTMLAudioElement | null => {
  return audioCache.get(url) || null;
};

export const useAudioPreload = (audioUrls?: string[]) => {
  const preloadedRef = useRef(false);

  useEffect(() => {
    if (preloadedRef.current) return;
    preloadedRef.current = true;

    const urlsToPreload = audioUrls || QUESTIONNAIRE_AUDIO_FILES;
    
    // Preload in batches to avoid overwhelming the browser
    const preloadBatch = async (urls: string[], batchSize = 3) => {
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        await Promise.allSettled(batch.map(preloadAudio));
      }
    };

    // Start preloading after a short delay to not block initial render
    const timer = setTimeout(() => {
      preloadBatch(urlsToPreload);
    }, 500);

    return () => clearTimeout(timer);
  }, [audioUrls]);
};

// Hook to preload next audios based on current step
export const usePreloadNextAudios = (currentStep: string) => {
  useEffect(() => {
    const stepAudioMap: Record<string, string[]> = {
      'welcome': ['/audio/rio-nombre.mp3'],
      'name': ['/audio/rio-edad.mp3'],
      'demographics': ['/audio/rio-fuma.mp3', '/audio/rio-density-q3.mp3'],
      'smoking': ['/audio/rio-brux-pregunta.mp3'],
      'bruxism': ['/audio/rio-diabetes-pregunta.mp3'],
      'diabetes': ['/audio/rio-pregunta-encias.mp3'],
      'gum-health': ['/audio/rio-feedback-encias.mp3'],
      'irp-processing': ['/audio/rio-implante-pregunta.mp3', '/audio/rio-resultados-intro.mp3'],
      'implant-history': ['/audio/rio-causa-pregunta.mp3'],
      'tooth-loss': ['/audio/rio-tiempo-pregunta.mp3'],
      'tooth-loss-time': ['/audio/rio-cuantos-dientes.mp3'],
    };

    const nextAudios = stepAudioMap[currentStep];
    if (nextAudios) {
      nextAudios.forEach(url => preloadAudio(url).catch(() => {}));
    }
  }, [currentStep]);
};

export default useAudioPreload;
