import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Ator, Destaque, Genero, Titulo, TmdbService } from '../../core/tmdb.service';
import { PerfilService } from '../../core/perfil.service';

gsap.registerPlugin(ScrollTrigger);

type Aba = 'sugestoes' | 'atores' | 'lista';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  selector: 'app-cinema',
  styleUrl: './cinema.css',
  templateUrl: './cinema.html',
})
export class Cinema implements OnInit, AfterViewInit {
  private readonly secao = viewChild<ElementRef<HTMLElement>>('secao');
  private readonly trilha = viewChild<ElementRef<HTMLElement>>('trilha');

  private readonly tmdb = inject(TmdbService);
  private readonly perfis = inject(PerfilService);

  readonly aba = signal<Aba>('sugestoes');
  readonly generos = signal<Genero[]>([]);
  readonly generoId = signal<number | 0>(0);

  readonly emCartaz = signal<Destaque[]>([]);
  readonly emCartazCarregando = signal(false);
  readonly destaque = signal<Destaque | null>(null);
  readonly sugestoes = signal<Titulo[]>([]);
  readonly sugestoesCarregando = signal(false);
  readonly erro = signal('');

  readonly atores = signal<Ator[]>([]);
  readonly atoresCarregando = signal(false);
  readonly atorEscolhido = signal<Ator | null>(null);
  readonly filmografia = signal<Titulo[]>([]);
  readonly filmografiaCarregando = signal(false);
  readonly busca = signal('');
  readonly novoNome = signal('');
  readonly pista = new Array(6).fill(0);

  readonly perfisDisponiveis = this.perfis.perfis;
  readonly perfilAtivo = this.perfis.ativo;

  ngOnInit(): void {
    this.carregarGeneros();
    this.buscarEmCartaz();
    this.buscarSugestoes();
  }

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.animarDestaque();
    this.animarTrilha();
    this.animarGrade();
  }

  private animarDestaque(): void {
    const secao = this.secao()?.nativeElement;
    if (!secao) return;

    const bandeira = secao.querySelector('[data-destaque-fundo]') as HTMLElement | null;
    if (bandeira) {
      gsap.to(bandeira, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: secao.querySelector('[data-destaque]') as HTMLElement,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

    gsap.from('[data-destaque-conteudo] > *', {
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: secao.querySelector('[data-destaque]') as HTMLElement,
        start: 'top 80%',
        once: true,
      },
    });
  }

  private animarTrilha(): void {
    const trilha = this.trilha()?.nativeElement;
    if (!trilha) return;

    const movimento = (): number => trilha.scrollWidth - window.innerWidth;

    gsap.to(trilha, {
      xPercent: -((movimento() / trilha.scrollWidth) * 100),
      ease: 'none',
      scrollTrigger: {
        trigger: trilha,
        start: 'top 75%',
        end: () => `+=${Math.min(movimento(), 2400)}`,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  private animarGrade(): void {
    const secao = this.secao()?.nativeElement;
    if (!secao) return;

    gsap.from('.cinema-card:not(.cinema-card-destaque)', {
      y: 80,
      opacity: 0,
      duration: 1,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.cinema-grade',
        start: 'top 85%',
        once: true,
      },
    });
  }

  trocarGenero(evento: Event): void {
    const id = Number((evento.target as HTMLSelectElement).value) || 0;
    this.generoId.set(id);
    this.buscarSugestoes();
  }

  async carregarGeneros(): Promise<void> {
    this.erro.set('');
    try {
      this.generos.set(await this.tmdb.listarGeneros('filme'));
    } catch {
      this.erro.set('Não foi possível carregar os gêneros.');
    }
  }

  async buscarEmCartaz(): Promise<void> {
    this.emCartazCarregando.set(true);
    try {
      const cartazes = await this.tmdb.emCartaz();
      this.emCartaz.set(cartazes);
      this.destaque.set(cartazes[0] ?? null);
    } catch {
      this.erro.set('Não foi possível buscar os filmes em cartaz.');
    } finally {
      this.emCartazCarregando.set(false);
    }
  }

  escolherDestaque(filme: Destaque): void {
    this.destaque.set(filme);
  }

  async buscarSugestoes(): Promise<void> {
    this.erro.set('');
    this.sugestoesCarregando.set(true);
    try {
      const generoId = this.generoId() || undefined;
      this.sugestoes.set(await this.tmdb.sugerir('filme', generoId));
    } catch {
      this.erro.set('Não foi possível buscar sugestões agora.');
      this.sugestoes.set([]);
    } finally {
      this.sugestoesCarregando.set(false);
    }
  }

  async buscarAtores(): Promise<void> {
    const termo = this.busca().trim();
    if (!termo) return;
    this.erro.set('');
    this.atoresCarregando.set(true);
    this.atorEscolhido.set(null);
    this.filmografia.set([]);
    try {
      this.atores.set(await this.tmdb.buscarAtor(termo));
    } catch {
      this.erro.set('Não foi possível buscar os atores.');
      this.atores.set([]);
    } finally {
      this.atoresCarregando.set(false);
    }
  }

  async escolherAtor(ator: Ator): Promise<void> {
    this.atorEscolhido.set(ator);
    this.filmografiaCarregando.set(true);
    try {
      this.filmografia.set(await this.tmdb.filmografiaDoAtor(ator.id));
    } catch {
      this.erro.set('Não foi possível carregar a filmografia.');
      this.filmografia.set([]);
    } finally {
      this.filmografiaCarregando.set(false);
    }
  }

  alterarLista(titulo: Titulo): void {
    const perfil = this.perfis.ativo();
    if (!perfil) return;
    this.perfis.salvarNaLista(perfil.id, titulo);
  }

  salvarDestaque(): void {
    const filme = this.destaque();
    if (!filme) return;
    this.alterarLista({
      id: filme.id,
      nome: filme.nome,
      ano: filme.ano,
      descricao: filme.descricao,
      cartaz: filme.cartaz,
      tipo: 'filme',
    });
  }

  destaqueNaLista(): boolean {
    const filme = this.destaque();
    if (!filme) return false;
    return this.estaNaLista({
      id: filme.id,
      nome: filme.nome,
      ano: filme.ano,
      descricao: filme.descricao,
      cartaz: filme.cartaz,
      tipo: 'filme',
    });
  }

  estaNaLista(titulo: Titulo): boolean {
    const perfil = this.perfis.ativo();
    return perfil ? this.perfis.estaNaLista(perfil.id, titulo) : false;
  }

  criarPerfil(nome: string): void {
    this.perfis.criarPerfil(nome);
  }

  selecionarPerfil(id: string): void {
    this.perfis.selecionar(id);
  }

  removerPerfil(id: string): void {
    this.perfis.removerPerfil(id);
  }

  listaAtual(): Titulo[] {
    const perfil = this.perfis.ativo();
    return perfil ? this.perfis.listaDe(perfil.id) : [];
  }
}