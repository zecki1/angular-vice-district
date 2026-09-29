import { Injectable, inject } from '@angular/core';
import { DestroyRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Lenis from 'lenis';

import { gsap, ScrollTrigger } from '../animation';

@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private lenis: Lenis | null = null;
  private initialized = false;

  init(): void {
    if (this.initialized || !isPlatformBrowser(this.platformId)) {
      return;
    }
    if (typeof window === 'undefined' || navigator.userAgent.includes('jsdom')) {
      return;
    }
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    this.initialized = true;
    this.lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    this.lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number): void => {
      this.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    this.destroyRef.onDestroy(() => {
      gsap.ticker.remove(raf);
      this.lenis?.destroy();
      this.lenis = null;
    });
  }

  stop(): void {
    this.lenis?.stop();
  }

  start(): void {
    this.lenis?.start();
  }
}
