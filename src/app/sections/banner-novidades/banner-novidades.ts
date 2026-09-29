import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TmdbService } from '../../core/tmdb.service';

gsap.registerPlugin(ScrollTrigger);

interface Novidade {
  nome: string;
  ano: string;
  cartaz: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-banner-novidades',
  styleUrl: './banner-novidades.css',
  templateUrl: './banner-novidades.html',
})
export class BannerNovidades implements OnInit {
  private readonly tmdb = inject(TmdbService);
  private readonly faixa = viewChild<ElementRef<HTMLElement>>('faixa');

  readonly novidades = signal<Novidade[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal('');

  readonly repetidas = computed<Novidade[]>(() => {
    const itens = this.novidades();
    return [...itens, ...itens];
  });

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const faixa = this.faixa()?.nativeElement;
      if (!faixa) return;
      gsap.to(faixa, {
        xPercent: -50,
        duration: 60,
        ease: 'none',
        repeat: -1,
      });
    });
  }

  ngOnInit(): void {
    void this.carregar();
  }

  private async carregar(): Promise<void> {
    try {
      const lancamentos = await this.tmdb.emBreve();
      this.novidades.set(
        lancamentos
          .filter((f) => f.cartaz)
          .map((f) => ({ nome: f.nome, ano: f.ano, cartaz: f.cartaz })),
      );
    } catch {
      this.erro.set('Em breve, novidades no cinema.');
    } finally {
      this.carregando.set(false);
    }
  }
}