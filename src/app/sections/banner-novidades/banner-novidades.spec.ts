import { TestBed } from '@angular/core/testing';
import { BannerNovidades } from './banner-novidades';
import { TmdbService, Destaque } from '../../core/tmdb.service';

function configurar(mock: { emBreve: () => Promise<Destaque[]> }) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [BannerNovidades],
    providers: [{ provide: TmdbService, useValue: mock }],
  });
}

describe('BannerNovidades', () => {
  it('deve carregar as novidades da API e duplicar para o loop', async () => {
    configurar({
      emBreve: () =>
        Promise.resolve([
          {
            id: 1,
            nome: 'Filme Novo',
            ano: '2026',
            descricao: '',
            cartaz: 'http://p/1.jpg',
            capa: 'http://p/larga.jpg',
            avaliacao: 7,
          },
        ]),
    });
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(BannerNovidades);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const itens = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.banner-novidades-item',
    );
    expect(fixture.componentInstance.novidades().length).toBe(1);
    expect(itens.length).toBe(2);
  });

  it('deve exibir estado vazio quando a API retorna nada', async () => {
    configurar({ emBreve: () => Promise.resolve([]) });
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(BannerNovidades);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const vazio = (fixture.nativeElement as HTMLElement).querySelector(
      '.banner-novidades-vazio',
    );
    expect(vazio?.textContent).toContain('Sem novidades');
  });
});