import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CharacterCard, Character } from '../../components/character-card/character-card';
import { TmdbService } from '../../core/tmdb.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CharacterCard],
  selector: 'app-characters',
  styleUrl: './characters.css',
  templateUrl: './characters.html',
})
export class Characters implements OnInit, AfterViewInit {
  private readonly tmdb = inject(TmdbService);
  readonly personagens: Character[] = [
    {
      nome: 'Lucía Vega',
      papel: 'A cantora que viu demais',
      descricao: 'Um palco, uma testemunha silenciosa e a chance de sair da cidade.',
      cor: '#ff2e88',
      grau: '01 — PROTAGONISTA',
    },
    {
      nome: 'Dom Reyes',
      papel: 'O promotor que não dorme',
      descricao: 'Caça o crime que ele mesmo ajudou a enterrar.',
      cor: '#00e5b0',
      grau: '02 — ANTAGONISTA',
    },
    {
      nome: 'Suki Tanaka',
      papel: 'A hacker da rede',
      descricao: 'Cada linha de código esconde uma dívida mais antiga que a cidade.',
      cor: '#7b61ff',
      grau: '03 — ALIADA',
    },
    {
      nome: 'Mara Sol',
      papel: 'A herdeira do cassino',
      descricao: 'Comprou o apertar de botões. Subestima o que o clique pode apagar.',
      cor: '#ffb02e',
      grau: '04 — PODER',
    },
  ];
  readonly comCapa = signal<Character[]>(this.personagens);

  ngOnInit(): void {
    void this.carregarCapas();
  }

  private async carregarCapas(): Promise<void> {
    try {
      const emCartaz = await this.tmdb.emCartaz();
      const anteriores = this.comCapa();
      const capas = new Map<string, string>();
      emCartaz.forEach((f, i) => {
        if (i < anteriores.length && f.cartaz) capas.set(anteriores[i].nome, f.cartaz);
      });
      this.comCapa.set(anteriores.map((p) => (capas.get(p.nome) ? { ...p, capa: capas.get(p.nome) } : p)));
    } catch {
      this.comCapa.set([...this.comCapa()]);
    }
  }

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.from('.card', {
      y: 80,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.characters-grid',
        start: 'top 85%',
        once: true,
      },
    });

    document.querySelectorAll<HTMLElement>('.characters-grid .card').forEach((card) => {
      const intensidade = 10;
      const entrar = (evento: MouseEvent): void => {
        const ret = card.getBoundingClientRect();
        const px = (evento.clientX - ret.left) / ret.width - 0.5;
        const py = (evento.clientY - ret.top) / ret.height - 0.5;
        gsap.to(card, {
          rotateY: px * intensidade,
          rotateX: -py * intensidade,
          duration: 0.6,
          ease: 'power2.out',
          transformPerspective: 800,
        });
      };
      const sair = (): void => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power2.out' });
      };
      card.addEventListener('mouseenter', entrar);
      card.addEventListener('mousemove', entrar);
      card.addEventListener('mouseleave', sair);
    });
  }
}