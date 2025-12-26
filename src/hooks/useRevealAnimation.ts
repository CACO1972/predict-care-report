import { useEffect, useRef, useState } from 'react';

interface UseRevealAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useRevealAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

export function useMultipleRevealAnimations(count: number, options?: UseRevealAnimationOptions) {
  const animations = Array.from({ length: count }, () => useRevealAnimation(options));
  return animations;
}
