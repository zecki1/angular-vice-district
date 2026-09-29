import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LOCAIS } from '../../core/content';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-locations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section class="bg-abyss px-6 py-28 md:px-12 md:py-36" data-testid="locations">
      <div class="mx-auto max-w-6xl">
        <h2
          apReveal
          class="font-display text-[clamp(2rem,6vw,4.5rem)] leading-[0.9] text-cream"
        >
          O TERRENO
        </h2>

        <ul class="mt-16 grid gap-6 sm:grid-cols-2">
          @for (l of locais; track l.id; let i = $index) {
            <li [attr.data-ap-reveal]="i * 90" class="relative overflow-hidden">
              <img
                [src]="l.imagem"
                [alt]="'Vista de ' + l.nome"
                loading="lazy"
                decoding="async"
                class="h-64 w-full object-cover opacity-70 transition duration-700 hover:scale-105 hover:opacity-100 md:h-80"
              />
              <div class="absolute inset-0 flex flex-col justify-end p-6">
                <p class="font-mono text-[0.65rem] tracking-[0.3em] text-neon">
                  {{ l.regiao }}
                </p>
                <h3 class="font-display mt-1 text-2xl text-cream">{{ l.nome }}</h3>
                <p class="mt-2 max-w-xs text-sm text-fog">{{ l.descricao }}</p>
              </div>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class LocationsComponent {
  protected readonly locais = LOCAIS;
}
