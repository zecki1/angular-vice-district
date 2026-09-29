import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type TipoMidia = 'filme' | 'serie';

export interface Genero {
  id: number;
  nome: string;
}

export interface Titulo {
  id: number;
  nome: string;
  ano: string;
  descricao: string;
  cartaz: string;
  tipo: TipoMidia;
}

export interface Ator {
  id: number;
  nome: string;
  foto: string;
}

export interface Destaque {
  id: number;
  nome: string;
  ano: string;
  descricao: string;
  cartaz: string;
  capa: string;
  avaliacao: number;
}

interface RespostaGenero {
  genres: { id: number; name: string }[];
}

interface RespostaDescobrir {
  results: {
    id: number;
    title?: string;
    name?: string;
    release_date?: string;
    first_air_date?: string;
    overview?: string;
    poster_path?: string | null;
  }[];
}

interface RespostaPessoas {
  results: { id: number; name: string; profile_path?: string | null }[];
}

interface RespostaCreditos {
  cast: {
    id: number;
    title?: string;
    name?: string;
    release_date?: string;
    overview?: string;
    poster_path?: string | null;
  }[];
}

interface RespostaCartaz {
  results: {
    id: number;
    title?: string;
    release_date?: string;
    overview?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private readonly chave = environment.tmdbApiKey;

  private montarUrl(caminho: string, extras = ''): string {
    const base = `${environment.tmdbBaseUrl}${caminho}?api_key=${this.chave}&language=pt-BR`;
    return extras ? `${base}${extras}` : base;
  }

  private async requisitar<T>(url: string): Promise<T> {
    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error(`Erro na API TMDB (${resposta.status})`);
    }
    return resposta.json() as Promise<T>;
  }

  private normalizar(
    r: RespostaDescobrir['results'][number],
    tipo: TipoMidia,
  ): Titulo {
    return {
      id: r.id,
      nome: (r.title ?? r.name ?? 'Sem título').trim(),
      ano: (r.release_date ?? r.first_air_date ?? '').slice(0, 4),
      descricao: (r.overview ?? '').trim(),
      cartaz: r.poster_path ? `${environment.tmdbImagem}${r.poster_path}` : '',
      tipo,
    };
  }

  async listarGeneros(tipo: TipoMidia): Promise<Genero[]> {
    const recurso = tipo === 'filme' ? 'movie' : 'tv';
    const dados = await this.requisitar<RespostaGenero>(
      this.montarUrl(`/genre/${recurso}/list`),
    );
    return dados.genres.map((g) => ({ id: g.id, nome: g.name }));
  }

  /**
   * Filmes em cartaz hoje, com capa ampla para destaque visual.
   */
  async emCartaz(): Promise<Destaque[]> {
    const dados = await this.requisitar<RespostaCartaz>(
      this.montarUrl('/movie/now_playing'),
    );
    return this.mapearDestaques(dados);
  }

  /**
   * Próximos lançamentos nos cinemas.
   */
  async emBreve(): Promise<Destaque[]> {
    const dados = await this.requisitar<RespostaCartaz>(
      this.montarUrl('/movie/upcoming'),
    );
    return this.mapearDestaques(dados);
  }

  private mapearDestaques(dados: RespostaCartaz): Destaque[] {
    return dados.results
      .filter((r) => Boolean(r.backdrop_path))
      .map((r) => ({
        id: r.id,
        nome: (r.title ?? 'Sem título').trim(),
        ano: (r.release_date ?? '').slice(0, 4),
        descricao: (r.overview ?? '').trim(),
        cartaz: r.poster_path
          ? `${environment.tmdbImagem}${r.poster_path}`
          : '',
        capa: `${environment.tmdbImagem}${r.backdrop_path}`,
        avaliacao: r.vote_average ?? 0,
      }));
  }

  /**
   * Sugere títulos populares de um tipo, filtrados por gênero quando informado.
   */
  async sugerir(tipo: TipoMidia, generoId?: number): Promise<Titulo[]> {
    const recurso = tipo === 'filme' ? 'movie' : 'tv';
    const genero = generoId ? `&with_genres=${generoId}` : '';
    const extras = `&sort_by=popularity.desc${genero}`;
    const dados = await this.requisitar<RespostaDescobrir>(
      this.montarUrl(`/discover/${recurso}`, extras),
    );
    return dados.results
      .filter((r) => Boolean(r.poster_path))
      .map((r) => this.normalizar(r, tipo));
  }

  async buscarAtor(nome: string): Promise<Ator[]> {
    const busca = encodeURIComponent(nome.trim());
    const dados = await this.requisitar<RespostaPessoas>(
      this.montarUrl('/search/person', `&query=${busca}`),
    );
    return dados.results.map((p) => ({
      id: p.id,
      nome: p.name,
      foto: p.profile_path ? `${environment.tmdbImagem}${p.profile_path}` : '',
    }));
  }

  async filmografiaDoAtor(atorId: number): Promise<Titulo[]> {
    const dados = await this.requisitar<RespostaCreditos>(
      this.montarUrl(`/person/${atorId}/movie_credits`),
    );
    return dados.cast
      .filter((r) => Boolean(r.poster_path))
      .map((r) => this.normalizar({ ...r, name: undefined, release_date: r.release_date }, 'filme'));
  }
}