import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LeadService } from '../../core/services/lead.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-newsletter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RevealDirective],
  template: `
    <section class="px-6 py-28 md:px-12 md:py-36" data-testid="newsletter">
      <div class="mx-auto max-w-3xl text-center">
        <p apReveal class="font-mono text-xs tracking-[0.5em] text-neon">PRIMEIRO A SABER</p>

        <h2
          apReveal="120"
          class="font-display mt-6 text-[clamp(2rem,6vw,4rem)] leading-[0.92] text-cream"
        >
          O DISTRITO ABRE<br />AS PORTAS UMA VEZ
        </h2>

        <p apReveal="240" class="mx-auto mt-6 max-w-lg text-fog">
          Um e-mail quando o lançamento acontecer. Sem spam, sem spoilers e sem
          newsletter de banco.
        </p>

        @if (lead.status() === 'ok') {
          <p
            class="mt-10 border border-verde/40 bg-verde/10 p-6 font-mono text-sm text-verde"
            role="status"
            data-testid="newsletter-ok"
          >
            {{ lead.mensagem() }}
          </p>
        } @else {
          <form
            class="mt-10 flex flex-col gap-3 sm:flex-row"
            (ngSubmit)="enviar()"
            novalidate
            data-testid="newsletter-form"
          >
            <label class="sr-only" for="newsletter-email">Seu e-mail</label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              autocomplete="email"
              placeholder="seu@email.com"
              [ngModel]="email()"
              (ngModelChange)="email.set($event)"
              [disabled]="lead.status() === 'enviando'"
              [attr.aria-invalid]="lead.status() === 'erro'"
              [attr.aria-describedby]="lead.status() === 'erro' ? 'newsletter-erro' : null"
              class="flex-1 border border-fog/25 bg-raised/50 px-5 py-4 font-mono text-sm text-cream placeholder:text-fog/50 focus:border-neon focus:outline-none"
            />
            <button
              type="submit"
              class="botao font-mono text-xs tracking-[0.25em] text-abyss"
              [disabled]="lead.status() === 'enviando'"
              data-testid="newsletter-enviar"
            >
              {{ lead.status() === 'enviando' ? 'ENVIANDO…' : 'QUERO ENTRAR' }}
            </button>
          </form>

          @if (lead.status() === 'erro') {
            <p
              id="newsletter-erro"
              class="mt-4 font-mono text-sm text-vermelho"
              role="alert"
              data-testid="newsletter-erro"
            >
              {{ lead.mensagem() }}
            </p>
          }
        }
      </div>
    </section>
  `,
  styles: `
    .botao {
      background: var(--color-neon);
      padding: 1rem 1.75rem;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .botao:hover:not(:disabled),
    .botao:focus-visible:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 0 30px -6px var(--color-neon);
    }
    .botao:disabled {
      opacity: 0.6;
      cursor: progress;
    }
  `,
})
export class NewsletterComponent {
  protected readonly lead = inject(LeadService);
  protected readonly email = signal('');

  protected async enviar(): Promise<void> {
    const ok = await this.lead.inscrever(this.email(), 'newsletter');
    if (ok) {
      this.email.set('');
    }
  }
}
