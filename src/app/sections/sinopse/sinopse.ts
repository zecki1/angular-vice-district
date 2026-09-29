import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TmdbService, Destaque } from '../../core/tmdb.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-sinopse',
  styleUrl: './sinopse.css',
  templateUrl: './sinopse.html',
})
export class Sinopse implements OnInit {
  private readonly tmdb = inject(TmdbService);
  private readonly etapa = viewChild<ElementRef<HTMLElement>>('etapa');

  readonly filme = signal<Destaque | null>(null);
  readonly paragrafos = signal<string[]>([]);
  readonly carregando = signal(true);

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.animarLinhas();
    });
  }

  ngOnInit(): void {
    void this.carregarDestaque();
  }

  private async carregarDestaque(): Promise<void> {
    try {
      const emCartaz = await this.tmdb.emCartaz();
      const melhor = emCartaz.sort((a, b) => b.avaliacao - a.avaliacao)[0] ?? null;
      this.filme.set(melhor);
      this.paragrafos.set(this.dividir(melhor?.descricao ?? ''));
    } finally {
      this.carregando.set(false);
    }
  }

  private dividir(texto: string): string[] {
    const partes = texto.split(/(?<=[.!?])\s+/).filter((p) => p.trim());
    return partes.length > 0 ? partes : ['Sem sinopse disponível no momento.'];
  }

  private animarLinhas(): void {
    const etapa = this.etapa()?.nativeElement;
    if (!etapa) return;
    const linhas = etapa.querySelectorAll<HTMLElement>('.sinopse-linha');
    if (linhas.length === 0) return;

    gsap.set(linhas, { opacity: 0.15, translateY: 0 });
    gsap.fromTo(
      linhas,
      { y: 60 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.4,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.sinopse',
          start: 'top top',
          end: () => `+=${linhas.length * 120}%`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      },
    );
  }
}