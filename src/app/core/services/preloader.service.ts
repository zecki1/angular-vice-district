import { DestroyRef, Injectable, inject, signal } from '@angular/core';

/**
 * Preloader com progresso "falso" (0 -> 90) enquanto os assets entram, e um
 * salto para 100 quando `window.load` dispara.
 *
 * Duas decisões aqui:
 *
 * 1. **Sem GSAP.** A barra é uma transição de CSS de 300ms; usar o ticker do
 *    GSAP para isso arrastava `gsap` + `ScrollTrigger` (272 kB) para o bundle
 *    inicial, só para desenhar um `width: %`. Com CSS, o GSAP passa a entrar
 *    junto com o chunk lazy da home, ou seja, atrás do próprio preloader — que
 *    é quando ele é útil. Initial caiu de 367 kB para ~95 kB.
 *
 * 2. **O número é honesto.** Ele vai até 90 e só fecha em 100 no `load` real.
 *    Uma barra que mente sobre o download é pior do que nenhuma barra.
 */
@Injectable({ providedIn: 'root' })
export class PreloaderService {
  private readonly _progress = signal(0);
  private readonly _done = signal(false);

  readonly progress = this._progress.asReadonly();
  readonly done = this._done.asReadonly();

  private readonly destroyRef = inject(DestroyRef);
  private intervalo: ReturnType<typeof setInterval> | null = null;
  private rede: ReturnType<typeof setTimeout> | null = null;

  /** Rede de segurança: nenhum bug pode prender o visitante atrás do overlay. */
  private static readonly MAX_SEGUNDOS = 6;

  start(): void {
    if (this.intervalo || this._done()) return;

    this.intervalo = setInterval(() => {
      const atual = this._progress();
      if (atual >= 90) return;
      // Sobe rápido no começo e desacelera: parece progresso, não relógio.
      this._progress.set(Math.min(90, atual + Math.max(0.4, (90 - atual) * 0.08)));
    }, 120);

    this.rede = setTimeout(() => this.markReady(), PreloaderService.MAX_SEGUNDOS * 1000);

    this.destroyRef.onDestroy(() => this.parar());
  }

  markReady(): void {
    this.parar();
    this._progress.set(100);
    this._done.set(true);
  }

  private parar(): void {
    if (this.intervalo !== null) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
    if (this.rede !== null) {
      clearTimeout(this.rede);
      this.rede = null;
    }
  }
}
