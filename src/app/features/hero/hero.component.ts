import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, inject, output } from '@angular/core';

import { canAnimate, gsap, ScrollTrigger } from '../../core/animation';
import { HERO_IMAGEM } from '../../core/content';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero relative flex min-h-svh items-end overflow-hidden" data-testid="hero">
      <img
        data-hero-fundo
        [src]="imagem"
        alt=""
        aria-hidden="true"
        fetchpriority="high"
        decoding="async"
        class="absolute inset-0 h-full w-full scale-110 object-cover"
      />
      <div class="vinheta absolute inset-0"></div>

      <div class="relative z-10 w-full px-6 pb-20 md:px-12 md:pb-28">
        <p class="font-mono text-xs tracking-[0.5em] text-neon">CAMPANHA OFICIAL · 2026</p>

        <h1
          data-hero-titulo
          class="font-display mt-6 text-[clamp(3rem,13vw,11rem)] leading-[0.85] text-cream"
        >
          VICE<br />DISTRICT
        </h1>

        <div class="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            class="botao-neon font-mono text-xs tracking-[0.25em] text-abyss"
            data-testid="hero-trailer"
            (click)="aoPedirTrailer.emit()"
          >
            ▶ ASSISTIR TRAILER
          </button>
          <p class="max-w-sm text-sm text-fog">
            Sob o sol de neon, a cidade nunca dorme. Role para descer ao distrito.
          </p>
        </div>
      </div>

      <p
        data-scroll-hint
        class="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 font-mono text-[0.65rem] tracking-[0.3em] text-fog/70"
        aria-hidden="true"
      >
        ↓ ROLE
      </p>
    </section>
  `,
  styles: `
    .hero {
      background: #0a0a0f;
    }
    .vinheta {
      background:
        linear-gradient(to top, rgb(10 10 15 / 0.95) 0%, rgb(10 10 15 / 0.2) 55%, rgb(10 10 15 / 0.7) 100%),
        linear-gradient(to right, rgb(10 10 15 / 0.7), transparent 60%);
    }
    .botao-neon {
      background: var(--color-neon);
      padding: 0.9rem 1.6rem;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .botao-neon:hover,
    .botao-neon:focus-visible {
      transform: translateY(-2px);
      box-shadow: 0 0 34px -6px var(--color-neon);
    }
    @media (prefers-reduced-motion: reduce) {
      .botao-neon:hover,
      .botao-neon:focus-visible {
        transform: none;
        box-shadow: none;
      }
    }
  `,
})
export class HeroComponent implements AfterViewInit {
  protected readonly imagem = HERO_IMAGEM;

  /** O pai (home) abre o modal: a section não deve conhecer o modal. */
  readonly aoPedirTrailer = output<void>();

  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!canAnimate()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('[data-hero-fundo]', { scale: 1.25, duration: 2.2 }, 0)
        .from('[data-hero-titulo]', { yPercent: 30, autoAlpha: 0, duration: 1.2 }, 0.2)
        .from('.botao-neon', { autoAlpha: 0, y: 20, duration: 0.8 }, 0.7);

      // Parallax do fundo: some devagar conforme a hero sai de cena.
      gsap.to('[data-hero-fundo]', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      gsap.to('[data-hero-titulo]', {
        yPercent: -22,
        autoAlpha: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      gsap.to('[data-scroll-hint]', {
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '15% top', scrub: true },
      });
    });

    this.destroyRef.onDestroy(() => {
      ctx.revert();
      ScrollTrigger.refresh();
    });
  }
}
