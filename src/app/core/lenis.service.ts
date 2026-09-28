import { Injectable } from '@angular/core';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Injectable({ providedIn: 'root' })
export class LenisService {
  private lenisInstance?: Lenis;

  iniciar(): void {
    if (this.lenisInstance) return;

    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzir) return;

    this.lenisInstance = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });

    this.lenisInstance.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((tempo) => {
      this.lenisInstance?.raf(tempo * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  parar(): void {
    this.lenisInstance?.stop();
  }

  iniciarScroll(): void {
    this.lenisInstance?.start();
  }

  pararPara(nome: string): void {
    this.parar();
    document.documentElement.classList.add('overflow-hidden');
    document.documentElement.dataset['lenisPrevent'] = nome;
  }

  rolarPara(seletor: string, offset = 0): void {
    const alvo = document.querySelector(seletor) as HTMLElement | null;
    if (!alvo) return;
    if (this.lenisInstance) {
      this.lenisInstance.scrollTo(alvo, { offset });
    } else {
      const topo = alvo.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: topo, behavior: 'smooth' });
    }
  }
}