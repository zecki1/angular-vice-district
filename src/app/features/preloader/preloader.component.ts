import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { PreloaderService } from '../../core/services/preloader.service';

@Component({
  selector: 'app-preloader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    @if (!removido()) {
      <div
        class="preloader fixed inset-0 z-100 flex flex-col items-center justify-center gap-7 bg-abyss"
        [class.saindo]="saindo()"
        data-testid="preloader"
        role="status"
        aria-live="polite"
        [attr.aria-label]="'Carregando ' + preloader.progress() + ' por cento'"
      >
        <p class="font-display text-5xl leading-none tracking-[0.35em] text-neon md:text-7xl">VICE</p>
        <p class="font-display text-5xl leading-none tracking-[0.35em] text-neon md:text-7xl">DISTRICT</p>

        <div class="h-px w-52 overflow-hidden bg-fog/25 md:w-80">
          <div
            class="barra h-full bg-neon"
            [style.width.%]="preloader.progress()"
            data-testid="preloader-progress"
          ></div>
        </div>

        <p class="font-mono text-xs tracking-[0.35em] text-fog">
          {{ preloader.progress() | number: '1.0-0' }}%
        </p>
      </div>
    }
  `,
  styles: `
    .preloader {
      opacity: 1;
      transition: opacity 0.6s ease, visibility 0.6s;
    }
    .preloader.saindo {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .barra {
      transition: width 0.3s ease-out;
    }
    @media (prefers-reduced-motion: reduce) {
      .barra {
        transition: none;
      }
    }
  `,
})
export class PreloaderComponent {
  protected readonly preloader = inject(PreloaderService);
  protected readonly saindo = signal(false);
  protected readonly removido = signal(false);

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      if (!this.preloader.done()) return;

      this.saindo.set(true);
      const timer = setTimeout(() => this.removido.set(true), 650);
      this.destroyRef.onDestroy(() => clearTimeout(timer));
    });
  }
}
