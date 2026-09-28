import { TestBed } from '@angular/core/testing';
import { Home } from './home';
import { TmdbService } from '../../core/tmdb.service';
import { PerfilService } from '../../core/perfil.service';

describe('Home', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        {
          provide: TmdbService,
          useValue: {
            listarGeneros: () => Promise.resolve([]),
            sugerir: () => Promise.resolve([]),
            buscarAtor: () => Promise.resolve([]),
            filmografiaDoAtor: () => Promise.resolve([]),
            emCartaz: () => Promise.resolve([]),
            emBreve: () => Promise.resolve([]),
          },
        },
      ],
    }).compileComponents();
    TestBed.inject(PerfilService);
  });

  it('deve renderizar todas as seções da landing', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-hero')).toBeTruthy();
    expect(compiled.querySelector('app-prologo')).toBeTruthy();
    expect(compiled.querySelector('app-characters')).toBeTruthy();
    expect(compiled.querySelector('#galeria')).toBeTruthy();
    expect(compiled.querySelector('app-banner-novidades')).toBeTruthy();
    expect(compiled.querySelector('app-cinema')).toBeTruthy();
    expect(compiled.querySelector('app-sinopse')).toBeTruthy();
    expect(compiled.querySelector('app-trailer-modal')).toBeTruthy();
    expect(compiled.querySelector('app-newsletter')).toBeTruthy();
  });
});