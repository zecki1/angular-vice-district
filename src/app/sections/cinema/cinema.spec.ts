import { TestBed } from '@angular/core/testing';
import { Cinema } from './cinema';
import { TmdbService } from '../../core/tmdb.service';
import { PerfilService } from '../../core/perfil.service';

const TITULO = {
  id: 1,
  nome: 'Duna',
  ano: '2021',
  descricao: 'Uma saga.',
  cartaz: 'http://img/duna.jpg',
  tipo: 'filme' as const,
};

const ATOR = { id: 42, nome: 'Al Pacino', foto: 'http://img/face.jpg' };

const DESTAQUE = {
  id: 2,
  nome: 'Oppenheimer',
  ano: '2023',
  descricao: 'O pai da bomba.',
  cartaz: 'http://img/opp.jpg',
  capa: 'http://img/opp-larga.jpg',
  avaliacao: 8.4,
};

describe('Cinema', () => {
  let tmdb: jasmine.SpyObj<TmdbService>;
  let perfis: PerfilService;

  beforeEach(async () => {
    localStorage.clear();
    tmdb = jasmine.createSpyObj<TmdbService>('TmdbService', [
      'listarGeneros',
      'emCartaz',
      'sugerir',
      'buscarAtor',
      'filmografiaDoAtor',
    ]);
    tmdb.listarGeneros.and.resolveTo([{ id: 28, nome: 'Ação' }]);
    tmdb.emCartaz.and.resolveTo([DESTAQUE]);
    tmdb.sugerir.and.resolveTo([TITULO]);
    tmdb.buscarAtor.and.resolveTo([ATOR]);
    tmdb.filmografiaDoAtor.and.resolveTo([TITULO]);
    await TestBed.configureTestingModule({
      imports: [Cinema],
      providers: [{ provide: TmdbService, useValue: tmdb }],
    }).compileComponents();
    perfis = TestBed.inject(PerfilService);
  });

  it('deve renderizar as abas e carregar o filme em destaque', async () => {
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.cinema-titulo')?.textContent).toContain('bilheteria');
    expect(compiled.querySelectorAll('.cinema-aba').length).toBe(3);
    expect(tmdb.emCartaz).toHaveBeenCalled();
    expect(fixture.componentInstance.destaque()).toEqual(DESTAQUE);
  });

  it('deve trocar o filme em destaque pela trilha de cartazes', () => {
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    const outro = { ...DESTAQUE, id: 9, nome: 'Barbie' };
    fixture.componentInstance.escolherDestaque(outro);
    expect(fixture.componentInstance.destaque()).toEqual(outro);
  });

  it('deve carregar as sugestões de filmes ao renderizar', () => {
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    expect(tmdb.listarGeneros).toHaveBeenCalledWith('filme');
    expect(tmdb.sugerir).toHaveBeenCalledWith('filme', undefined);
  });

  it('deve buscar novos filmes ao escolher um gênero', () => {
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    tmdb.sugerir.calls.reset();
    fixture.componentInstance.trocarGenero({ target: { value: '28' } } as unknown as Event);
    fixture.detectChanges();
    expect(tmdb.sugerir).toHaveBeenCalledWith('filme', 28);
  });

  it('deve buscar atores e carregar a filmografia', async () => {
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp.busca.set('Pacino');
    await comp.buscarAtores();
    fixture.detectChanges();
    expect(comp.atores()).toEqual([ATOR]);
    await comp.escolherAtor(ATOR);
    fixture.detectChanges();
    expect(comp.atorEscolhido()).toEqual(ATOR);
    expect(comp.filmografia()).toHaveSize(1);
  });

  it('deve salvar o filme em destaque na lista do perfil ativo', async () => {
    const perfil = perfis.criarPerfil('Ana');
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.componentInstance.salvarDestaque();
    expect(perfis.listaDe(perfil.id)).toHaveSize(1);
    expect(fixture.componentInstance.destaqueNaLista()).toBeTrue();
  });

  it('deve salvar na lista do perfil ativo', () => {
    const perfil = perfis.criarPerfil('Ana');
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    fixture.componentInstance.alterarLista(TITULO);
    expect(perfis.listaDe(perfil.id)).toHaveSize(1);
    expect(fixture.componentInstance.estaNaLista(TITULO)).toBeTrue();
  });

  it('deve ignorar a tentativa de salvar sem perfil', () => {
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    fixture.componentInstance.alterarLista(TITULO);
    expect(fixture.componentInstance.estaNaLista(TITULO)).toBeFalse();
  });

  it('deve listar apenas os títulos do perfil ativo', () => {
    const ana = perfis.criarPerfil('Ana');
    perfis.criarPerfil('Bruno');
    perfis.salvarNaLista(ana.id, TITULO);
    perfis.selecionar(ana.id);
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    expect(fixture.componentInstance.listaAtual()).toEqual([TITULO]);
  });

  it('deve exibir mensagem de erro quando a API falha', async () => {
    tmdb.sugerir.and.rejectWith(new Error('falha'));
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.componentInstance.erro()).toContain('buscar sugestões');
  });

  it('deve cobrir erro ao carregar o em cartaz', async () => {
    tmdb.emCartaz.and.rejectWith(new Error('falha'));
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.componentInstance.erro()).toContain('em cartaz');
  });

  it('deve ignorar chamada de gêneros que falha', async () => {
    tmdb.listarGeneros.and.rejectWith(new Error('falha'));
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.componentInstance.erro()).toContain('gêneros');
  });

  it('deve usar o valor 0 do select como "todos"', () => {
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    tmdb.sugerir.calls.reset();
    fixture.componentInstance.trocarGenero({ target: { value: '0' } } as unknown as Event);
    expect(tmdb.sugerir).toHaveBeenCalledWith('filme', undefined);
  });

  it('deve suportar em cartaz vazio', async () => {
    tmdb.emCartaz.and.resolveTo([]);
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.destaque()).toBeNull();
    expect(fixture.componentInstance.emCartaz()).toEqual([]);
  });

  it('deve ignorar busca de ator sem termo', async () => {
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    await fixture.componentInstance.buscarAtores();
    expect(tmdb.buscarAtor).not.toHaveBeenCalled();
  });

  it('deve ignorar salvar destaque inexistente', () => {
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    expect(fixture.componentInstance.destaqueNaLista()).toBeFalse();
  });

  it('deve retornar lista vazia sem perfil ativo', () => {
    const fixture = TestBed.createComponent(Cinema);
    fixture.detectChanges();
    expect(fixture.componentInstance.listaAtual()).toEqual([]);
  });
});