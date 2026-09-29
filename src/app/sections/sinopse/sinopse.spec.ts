import { TestBed } from '@angular/core/testing';
import { Sinopse } from './sinopse';
import { TmdbService, Destaque } from '../../core/tmdb.service';

function configurar(mock: { emCartaz: () => Promise<Destaque[]> }) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [Sinopse],
    providers: [{ provide: TmdbService, useValue: mock }],
  });
}

describe('Sinopse', () => {
  it('deve escolher o filme com melhor avaliação para a sinopse', async () => {
    configurar({
      emCartaz: () =>
        Promise.resolve([
          {
            id: 1,
            nome: 'Regular',
            ano: '2026',
            descricao: 'Bom. Legal.',
            cartaz: '',
            capa: 'http://p/a.jpg',
            avaliacao: 6,
          },
          {
            id: 2,
            nome: 'Topo',
            ano: '2026',
            descricao: 'Melhor. Sinopse.',
            cartaz: '',
            capa: 'http://p/b.jpg',
            avaliacao: 9,
          },
        ]),
    });
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(Sinopse);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.filme()?.nome).toBe('Topo');
    expect(fixture.componentInstance.paragrafos().length).toBe(2);
  });

  it('deve dividir a sinopse em parágrafos na pontuação', () => {
    configurar({
      emCartaz: () =>
        Promise.resolve([
          {
            id: 3,
            nome: 'Obra',
            ano: '1986',
            descricao: 'Primeira frase. Segunda frase!',
            cartaz: '',
            capa: '',
            avaliacao: 8,
          },
        ]),
    });
    const fixture = TestBed.createComponent(Sinopse);
    fixture.detectChanges();
    const dividir = fixture.componentInstance['dividir'];
    expect(dividir('A. B! C?')).toEqual(['A.', 'B!', 'C?']);
    expect(dividir('')).toEqual(['Sem sinopse disponível no momento.']);
  });

  it('deve exibir mensagem quando a sinopse vazia', async () => {
    configurar({ emCartaz: () => Promise.resolve([]) });
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(Sinopse);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.paragrafos()).toEqual([
      'Sem sinopse disponível no momento.',
    ]);
  });
});