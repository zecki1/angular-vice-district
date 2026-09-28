import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PROLOGO } from '../../core/content';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { ParallaxDirective } from '../../shared/directives/parallax.directive';

@Component({
  selector: 'app-prologo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, ParallaxDirective],
  template: `
    <section class="relative overflow-hidden px-6 py-28 md:px-12 md:py-40" data-testid="prologo">
      <div class="mx-auto max-w-6xl">
        <p apReveal class="font-mono text-xs tracking-[0.5em] text-neon" data-testid="prologo-titulo">
          PRÓLOGO
        </p>

        <div class="mt-14 grid gap-16 md:grid-cols-2 md:gap-10">
          @for (bloco of blocos; track bloco.imagem) {
            <figure class="relative">
              <div class="overflow-hidden">
                <img
                  apParallax="0.3"
                  [src]="bloco.imagem"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  class="h-64 w-full scale-125 object-cover opacity-80 md:h-96"
                />
              </div>
              <figcaption
                apReveal
                class="mt-8 text-lg leading-relaxed text-fog md:text-xl"
              >
                {{ bloco.texto }}
              </figcaption>
            </figure>
          }
        </div>
      </div>
    </section>
  `,
})
export class PrologoComponent {
  protected readonly blocos = PROLOGO;
}
