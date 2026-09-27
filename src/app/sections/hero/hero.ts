import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, inject, viewChild } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroSceneService } from '../../core/hero-scene.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-hero',
  styleUrl: './hero.css',
  templateUrl: './hero.html',
})
export class Hero implements OnInit, AfterViewInit {
  private readonly ctx = inject(HeroSceneService);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('cena');
  private readonly titulo = viewChild<ElementRef<HTMLElement>>('titulo');

  ngOnInit(): void {
    this.ctx.iniciarQuandoPronto(() => this.canvas()?.nativeElement ?? null);
  }

  ngAfterViewInit(): void {
    this.animarTitulo();
  }

  /** Ao rolar, o título encolhe e desloca-se (scale down + fade). */
  private animarTitulo(): void {
    const el = this.titulo()?.nativeElement;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.to(el, {
      scale: 0.7,
      opacity: 0.2,
      yPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    gsap.from('.hero-titulo-linha, .hero-eyebrow, .hero-subtitulo, .hero-acoes, .hero-faixa', {
      y: 60,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 0.3,
    });
  }
}