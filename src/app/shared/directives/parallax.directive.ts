import { AfterViewInit, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

import { canAnimate, gsap, ScrollTrigger } from '../../core/animation';

/**
 * Parallax por elemento: `apParallax="0.25"` move o alvo 25% do deslocamento
 * do scroll. O valor é lido de `data-ap-parallax`, então o template continua
 * sendo a fonte da verdade — nada de config em TS duplicando o markup.
 */
@Directive({
  selector: '[apParallax]',
  standalone: true,
})
export class ParallaxDirective implements AfterViewInit {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!canAnimate()) {
      return;
    }

    const intensidade = parseFloat(this.el.nativeElement.dataset['apParallax'] ?? '0.2');
    if (!Number.isFinite(intensidade) || intensidade === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        this.el.nativeElement,
        { yPercent: -intensidade * 50 },
        {
          yPercent: intensidade * 50,
          ease: 'none',
          scrollTrigger: {
            trigger: this.el.nativeElement.parentElement ?? this.el.nativeElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    });

    this.destroyRef.onDestroy(() => {
      ctx.revert();
      ScrollTrigger.refresh();
    });
  }
}
