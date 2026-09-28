import { TestBed } from '@angular/core/testing';
import { TmdbService } from './tmdb.service';

describe('TmdbService', () => {
  let service: TmdbService;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    fetchSpy = spyOn(window, 'fetch').and.resolveTo({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
    service = TestBed.inject(TmdbService);
  });

  afterEach(() => {
    fetchSpy.calls.reset();
  });

  it('deve listar gêneros de filmes', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: () => Promise.resolve({ genres: [{ id: 28, name: 'Ação' }] }),
    } as Response);
    const generos = await service.listarGeneros('filme');
    expect(generos).toEqual([{ id: 28, nome: 'Ação' }]);
    expect(fetchSpy).toHaveBeenCalledWith(
      jasmine.stringMatching('/genre/movie/list'),
    );
  });

  it('deve listar gêneros de séries', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: () => Promise.resolve({ genres: [{ id: 10765, name: 'Sci-Fi' }] }),
    } as Response);
    const generos = await service.listarGeneros('serie');
    expect(generos).toEqual([{ id: 10765, nome: 'Sci-Fi' }]);
    expect(fetchSpy).toHaveBeenCalledWith(
      jasmine.stringMatching('/genre/tv/list'),
    );
  });

  it('deve sugerir títulos populares sem filtro de gênero', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: 1,
              title: 'Duna',
              release_date: '2021-10-21',
              overview: 'Uma saga.',
              poster_path: '/abc.jpg',
            },
            { id: 2, name: 'Sem cartaz', poster_path: null },
          ],
        }),
    } as Response);
    const sugestoes = await service.sugerir('filme');
    expect(sugestoes).toHaveSize(1);
    expect(sugestoes[0]).toEqual({
      id: 1,
      nome: 'Duna',
      ano: '2021',
      descricao: 'Uma saga.',
      cartaz: jasmine.stringMatching('/abc.jpg'),
      tipo: 'filme',
    });
  });

  it('deve filtrar por gênero nas sugestões de séries', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    } as Response);
    await service.sugerir('serie', 10765);
    expect(fetchSpy).toHaveBeenCalledWith(
      jasmine.stringMatching('/discover/tv'),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      jasmine.stringMatching('with_genres=10765'),
    );
  });

  it('deve buscar atores por nome', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [{ id: 42, name: 'Al Pacino', profile_path: '/face.jpg' }],
        }),
    } as Response);
    const atores = await service.buscarAtor('Al Pacino');
    expect(atores).toEqual([
      { id: 42, nome: 'Al Pacino', foto: jasmine.stringMatching('/face.jpg') },
    ]);
    expect(fetchSpy).toHaveBeenCalledWith(
      jasmine.stringMatching('/search/person'),
    );
  });

  it('deve retornar a filmografia do ator', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: () =>
        Promise.resolve({
          cast: [
            {
              id: 7,
              title: 'O Poderoso Chefão',
              release_date: '1972-03-24',
              overview: 'Uma família mafiosa.',
              poster_path: '/chefao.jpg',
            },
          ],
        }),
    } as Response);
    const filmes = await service.filmografiaDoAtor(42);
    expect(filmes).toHaveSize(1);
    expect(filmes[0].nome).toBe('O Poderoso Chefão');
    expect(filmes[0].tipo).toBe('filme');
  });

  it('deve listar os filmes em cartaz com capa ampla', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: 2,
              title: 'Oppenheimer',
              release_date: '2023-07-20',
              overview: 'O pai da bomba.',
              poster_path: '/opp.jpg',
              backdrop_path: '/opp-larga.jpg',
              vote_average: 8.4,
            },
            { id: 3, title: 'Sem capa', poster_path: '/x.jpg', backdrop_path: null },
          ],
        }),
    } as Response);
    const cartazes = await service.emCartaz();
    expect(cartazes).toHaveSize(1);
    expect(cartazes[0]).toEqual({
      id: 2,
      nome: 'Oppenheimer',
      ano: '2023',
      descricao: 'O pai da bomba.',
      cartaz: jasmine.stringMatching('/opp.jpg') as unknown as string,
      capa: jasmine.stringMatching('/opp-larga.jpg') as unknown as string,
      avaliacao: 8.4,
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      jasmine.stringMatching('/movie/now_playing'),
    );
  });

  it('deve lançar erro quando a resposta não é ok', async () => {
    fetchSpy.and.resolveTo({ ok: false, status: 401 } as Response);
    await expectAsync(service.listarGeneros('filme')).toBeRejected();
  });

  it('deve listar os lançamentos em breve', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: 9,
              title: 'Novo Filme',
              release_date: '2026-12-01',
              overview: 'Em breve.',
              poster_path: '/futuro.jpg',
              backdrop_path: '/futuro-larga.jpg',
              vote_average: 0,
            },
            { id: 10, title: 'Sem capa', poster_path: null, backdrop_path: null },
          ],
        }),
    } as Response);
    const lancamentos = await service.emBreve();
    expect(lancamentos).toHaveSize(1);
    expect(lancamentos[0].nome).toBe('Novo Filme');
    expect(lancamentos[0].ano).toBe('2026');
    expect(fetchSpy).toHaveBeenCalledWith(
      jasmine.stringMatching('/movie/upcoming'),
    );
  });

  it('deve aplicar fallbacks para campos ausentes nas sugestões', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: 5,
              title: null,
              name: 'Série sem data',
              overview: null,
              poster_path: '/p.jpg',
            },
          ],
        }),
    } as Response);
    const sugestoes = await service.sugerir('filme');
    expect(sugestoes[0]).toEqual({
      id: 5,
      nome: 'Série sem data',
      ano: '',
      descricao: '',
      cartaz: jasmine.stringMatching('/p.jpg') as unknown as string,
      tipo: 'filme',
    });
  });

  it('deve aplicar fallbacks nos filmes em cartaz', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: 8,
              title: null,
              release_date: null,
              overview: null,
              poster_path: null,
              backdrop_path: '/plano.jpg',
              vote_average: null,
            },
          ],
        }),
    } as Response);
    const [filme] = await service.emCartaz();
    expect(filme.nome).toBe('Sem título');
    expect(filme.ano).toBe('');
    expect(filme.descricao).toBe('');
    expect(filme.cartaz).toBe('');
    expect(filme.avaliacao).toBe(0);
  });

  it('deve aplicar fallback de foto para ator sem foto', async () => {
    fetchSpy.and.resolveTo({
      ok: true,
      json: () =>
        Promise.resolve({ results: [{ id: 7, name: 'Sem Face', profile_path: null }] }),
    } as Response);
    const atores = await service.buscarAtor('Sem Face');
    expect(atores[0].foto).toBe('');
  });
});