import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Guarda única para animações: só anima em browser real,
 * fora de jsdom (testes) e respeitando `prefers-reduced-motion`.
 */
export function canAnimate(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  if (navigator.userAgent.includes('jsdom')) {
    return false;
  }
  if (typeof window.matchMedia !== 'function') {
    return false;
  }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isPointerFine(): boolean {
  return canAnimate() && window.matchMedia('(pointer: fine)').matches;
}

export { gsap, ScrollTrigger };
