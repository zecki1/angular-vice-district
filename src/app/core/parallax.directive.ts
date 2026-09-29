import { AfterViewInit, Directive, ElementRef, inject, Input } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Aplica um deslocamento vertical suave conforme o elemento atravessa a viewport. */
@Directive({
  selector: '[apParallax]',
})
export class ParallaxDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);

  @Input() apParallax = 40;

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.to(this.el.nativeElement, {
      yPercent: this.apParallax,
      ease: 'none',
      scrollTrigger: {
        trigger: this.el.nativeElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }
}