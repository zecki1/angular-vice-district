import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { canAnimate, gsap } from '../../core/animation';

/** IDs do YouTube são alfanuméricos com `-`/`_`; nada de barra, aspas ou `:`. */
const VIDEO_ID_RE = /^[A-Za-z0-9_-]{6,20}$/;

@Component({
  selector: 'app-trailer-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (aberto()) {
      <div class="fixed inset-0 z-90 flex items-center justify-center p-4">
        <button
          type="button"
          class="fundo absolute inset-0 h-full w-full bg-abyss/95"
          tabindex="-1"
          aria-label="Fechar trailer"
          data-testid="trailer-backdrop"
          (click)="fechar()"
        ></button>

        <div
          #painel
          class="relative w-full max-w-4xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trailer-titulo"
          data-testid="trailer-modal"
        >
          <h2 id="trailer-titulo" class="sr-only">Trailer de Vice District</h2>

          <div class="aspect-video w-full overflow-hidden bg-raised">
            @if (urlTrailer(); as url) {
              <iframe
                class="h-full w-full"
                [src]="url"
                title="Trailer de Vice District"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                data-testid="trailer-iframe"
              ></iframe>
            } @else {
              <div
                class="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center"
                data-testid="trailer-sem-video"
              >
                <p class="font-display text-xl text-cream md:text-3xl">TRAILER EM MONTAGEM</p>
                <p class="max-w-md text-sm text-fog">
                  O vídeo da campanha ainda não foi publicado. Enquanto isso, o distrito continua
                  aberto — se inscreva na newsletter para receber o lançamento primeiro.
                </p>
              </div>
            }
          </div>

          @if (videoId(); as id) {
            <!-- Alternativa textual ao embed: um iframe sozinho não é acessível. -->
            <a
              class="mt-4 inline-block font-mono text-[0.65rem] tracking-[0.25em] text-fog underline underline-offset-4 hover:text-neon"
              [href]="'https://www.youtube.com/watch?v=' + id"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="trailer-link"
            >
              ASSISTIR NO YOUTUBE ↗
            </a>
          }

          <button
            type="button"
            class="botao-fechar absolute -top-3 -right-3 flex h-11 w-11 items-center justify-center bg-neon font-mono text-abyss"
            aria-label="Fechar trailer"
            data-testid="trailer-fechar"
            (click)="fechar()"
          >
            ✕
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .botao-fechar {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .botao-fechar:hover,
    .botao-fechar:focus-visible {
      transform: rotate(90deg);
      box-shadow: 0 0 26px -4px var(--color-neon);
    }
  `,
})
export class TrailerModalComponent implements OnDestroy {
  readonly aberto = input.required<boolean>();
  readonly videoId = input<string>('');
  readonly aoFechar = output<void>();

  private readonly painel = viewChild<ElementRef<HTMLElement>>('painel');
  private readonly document = inject(DOCUMENT);
  private readonly sanitizer = inject(DomSanitizer);

  private elementoAnterior: HTMLElement | null = null;
  private tecladoAtivo = false;

  /**
   * O Angular bloqueia string concatenada em `[src]` de iframe (NG0904) — e
   * com razão: qualquer `javascript:` ou barra invertida passaria direto.
   * Então o ID é validado por regex e só depois liberamos a URL. ID inválido
   * cai no estado "em montagem", o que também esconde o erro em vez de
   * gerar um iframe quebrado.
   */
  protected urlTrailer = computed<SafeResourceUrl | null>(() => {
    const id = this.videoId().trim();
    if (!VIDEO_ID_RE.test(id)) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
    );
  });

  private readonly aoTeclar = (evento: KeyboardEvent): void => {
    if (evento.key === 'Escape') {
      this.aoFechar.emit();
      return;
    }
    if (evento.key === 'Tab') {
      this.prenderFoco(evento);
    }
  };

  constructor() {
    // Reage à mudança do input (e não a afterNextRender): o modal é criado
    // e destruído por @if, então quem precisa avisar é o signal.
    effect(() => {
      if (this.aberto()) {
        this.aoAbrir();
      } else {
        this.aoVoltar();
      }
    });
  }

  protected fechar(): void {
    this.aoFechar.emit();
  }

  ngOnDestroy(): void {
    this.desligarTeclado();
  }

  private aoAbrir(): void {
    this.elementoAnterior = this.document.activeElement as HTMLElement | null;
    this.ligarTeclado();
    this.document.body.style.overflow = 'hidden';

    if (canAnimate()) {
      // `opacity`, e não `autoAlpha`: autoAlpha escreve `visibility: hidden`
      // durante a entrada, e aí o foco no botão de fechar cai no vazio —
      // quem só usa teclado começa o Tab do começo da página a cada abertura.
      gsap.from('[data-testid="trailer-modal"]', {
        scale: 0.94,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out',
      });
    }

    this.focarFechar();
  }

  private focarFechar(): void {
    this.painel()?.nativeElement.querySelector<HTMLElement>('button')?.focus();
  }

  private aoVoltar(): void {
    this.desligarTeclado();
    this.document.body.style.overflow = '';
    this.elementoAnterior?.focus();
    this.elementoAnterior = null;
  }

  private ligarTeclado(): void {
    if (this.tecladoAtivo) return;
    this.tecladoAtivo = true;
    this.document.addEventListener('keydown', this.aoTeclar);
  }

  private desligarTeclado(): void {
    if (!this.tecladoAtivo) return;
    this.tecladoAtivo = false;
    this.document.removeEventListener('keydown', this.aoTeclar);
  }

  /** Focus trap: só o painel é navegável, o resto da página não. */
  private prenderFoco(evento: KeyboardEvent): void {
    const raiz = this.painel()?.nativeElement;
    if (!raiz) return;

    const focaveis = Array.from(
      raiz.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focaveis.length === 0) return;

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    const atual = this.document.activeElement;

    if (evento.shiftKey && atual === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && atual === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }
}
