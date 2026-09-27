import { TestBed } from '@angular/core/testing';
import { Characters } from './characters';
import { CharacterCard } from '../../components/character-card/character-card';
import { TmdbService } from '../../core/tmdb.service';

describe('Characters', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Characters, CharacterCard],
      providers: [
        {
          provide: TmdbService,
          useValue: { emCartaz: () => Promise.resolve([]) },
        },
      ],
    }).compileComponents();
  });

  it('deve renderizar um card por personagem', () => {
    const fixture = TestBed.createComponent(Characters);
    fixture.detectChanges();
    const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('app-character-card');
    expect(cards.length).toBe(fixture.componentInstance.personagens.length);
  });

  it('deve conter o elenco esperado', () => {
    const fixture = TestBed.createComponent(Characters);
    const nomes = fixture.componentInstance.personagens.map((p) => p.nome);
    expect(nomes).toContain('Lucía Vega');
    expect(nomes).toContain('Dom Reyes');
  });
});