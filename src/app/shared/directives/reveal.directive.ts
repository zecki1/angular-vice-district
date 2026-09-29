import { AfterViewInit, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

import { canAnimate, gsap, ScrollTrigger } from '../../core/animation';

/**
 * Entrada padrão de qualquer elemento marcado com `apReveal`.
 * `apReveal="120"` atrasa o elemento em ms (stagger sem JS extra).
 */
@Directive({
  selector: '[apReveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!canAnimate()) {
      return;
    }

    const atraso = Number(this.el.nativeElement.dataset['apReveal'] ?? 0) || 0;

    const ctx = gsap.context(() => {
      gsap.from(this.el.nativeElement, {
        y: 48,
        autoAlpha: 0,
        duration: 1,
        delay: atraso / 1000,
        ease: 'power3.out',
        scrollTrigger: { trigger: this.el.nativeElement, start: 'top 88%', once: true },
      });
    });

    this.destroyRef.onDestroy(() => {
      ctx.revert();
      ScrollTrigger.refresh();
    });
  }
}
