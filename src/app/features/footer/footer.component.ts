import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-fog/10 px-6 py-14 md:px-12" data-testid="footer">
      <div
        class="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p class="font-display text-xl tracking-[0.3em] text-cream">VICE DISTRICT</p>
          <p class="mt-2 max-w-xs text-xs leading-relaxed text-fog">
            Campanha de demonstração. Personagens, locais e narrativa são ficcionais.
          </p>
        </div>

        <nav aria-label="Rodapé" class="flex flex-wrap gap-x-8 gap-y-3">
          <a class="link" href="#characters">Personagens</a>
          <a class="link" href="#locations">Locais</a>
          <a class="link" href="#newsletter">Newsletter</a>
        </nav>

        <p class="font-mono text-[0.65rem] tracking-[0.2em] text-fog">
          © 2026 · ANGULAR 22 · ZONELESS
        </p>
      </div>
    </footer>
  `,
  styles: `
    .link {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--color-fog);
      transition: color 0.25s ease;
    }
    .link:hover,
    .link:focus-visible {
      color: var(--color-neon);
    }
  `,
})
export class FooterComponent {}
