import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PERSONAGENS } from '../../core/content';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-characters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section class="px-6 py-28 md:px-12 md:py-36" data-testid="characters">
      <div class="mx-auto max-w-6xl">
        <h2
          apReveal
          class="font-display text-[clamp(2rem,6vw,4.5rem)] leading-[0.9] text-cream"
        >
          QUEM ANDA<br />NO DISTRITO
        </h2>

        <ul class="mt-16 grid gap-8 md:grid-cols-3">
          @for (p of personagens; track p.id; let i = $index) {
            <li
              class="group relative overflow-hidden border border-fog/10 bg-raised/40"
              [attr.data-ap-reveal]="i * 120"
            >
              <img
                [src]="p.imagem"
                [alt]="'Retrato de ' + p.nome"
                loading="lazy"
                decoding="async"
                class="h-96 w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                [style.--tint]="p.cor"
              />
              <div
                class="absolute inset-x-0 bottom-0 p-6"
                [style.background]="'linear-gradient(to top, ' + p.cor + 'dd, transparent)'"
              >
                <p class="font-mono text-[0.65rem] tracking-[0.3em] text-abyss/80">
                  {{ p.papel }}
                </p>
                <h3 class="font-display mt-2 text-2xl text-abyss">{{ p.nome }}</h3>
              </div>
              <p class="p-6 text-sm leading-relaxed text-fog">{{ p.descricao }}</p>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    li {
      transition: border-color 0.4s ease, transform 0.4s ease;
    }
    li:hover {
      border-color: color-mix(in srgb, var(--tint, #ff4d2e) 45%, transparent);
      transform: translateY(-6px);
    }
    @media (prefers-reduced-motion: reduce) {
      li:hover,
      img {
        transform: none !important;
        transition: none;
      }
    }
  `,
})
export class CharactersComponent {
  protected readonly personagens = PERSONAGENS;
}
