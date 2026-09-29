import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, inject, viewChild } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TmdbService } from '../../core/tmdb.service';

gsap.registerPlugin(ScrollTrigger);

interface Painel {
  titulo: string;
  legenda: string;
  cor: string;
  eyebrow: string;
  capa: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-gallery-horizontal',
  styleUrl: './gallery-horizontal.css',
  templateUrl: './gallery-horizontal.html',
})
export class GalleryHorizontal implements OnInit, AfterViewInit {
  private readonly tmdb = inject(TmdbService);
  private readonly trilha = viewChild<ElementRef<HTMLElement>>('trilha');

  readonly paineis: Painel[] = [
    { titulo: 'Neon District', legenda: 'Avenida das Luzes', cor: '#e50914', eyebrow: 'Ep. 01', capa: '' },
    { titulo: 'Cassino Palmeira', legenda: 'Noite de abertura', cor: '#ffb02e', eyebrow: 'Ep. 02', capa: '' },
    { titulo: 'Yards', legenda: 'Distrito industrial', cor: '#7b61ff', eyebrow: 'Ep. 03', capa: '' },
    { titulo: 'Porto Norte', legenda: 'O embarque', cor: '#00c4a0', eyebrow: 'Ep. 04', capa: '' },
    { titulo: 'Soberano', legenda: 'O palácio', cor: '#2e7bff', eyebrow: 'Ep. 05', capa: '' },
  ];

  ngOnInit(): void {
    void this.carregarCapas();
  }

  private async carregarCapas(): Promise<void> {
    try {
      const emCartaz = await this.tmdb.emCartaz();
      const capas = emCartaz.filter((f) => f.nome).slice(0, this.paineis.length).map((f) => f.cartaz);
      for (let i = 0; i < capas.length; i++) {
        if (capas[i]) this.paineis[i].capa = capas[i];
      }
    } catch {
      /* mantém URLs padrão */
    }
  }

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const trilha = this.trilha()?.nativeElement;
    if (!trilha) return;

    const movimento = (): number => {
      return trilha.scrollWidth - window.innerWidth;
    };

    gsap.to(trilha, {
      xPercent: -((movimento() / trilha.scrollWidth) * 100),
      ease: 'none',
      scrollTrigger: {
        trigger: trilha,
        start: 'top top',
        end: () => `+=${movimento()}`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
  }
}