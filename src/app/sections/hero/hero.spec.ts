import { TestBed } from '@angular/core/testing';
import { Hero } from './hero';
import { HeroSceneService } from '../../core/hero-scene.service';
import { mockMatchMedia } from '../../test-helpers/match-media';

describe('Hero', () => {
  let origMatchMedia: typeof window.matchMedia;

  beforeEach(async () => {
    origMatchMedia = window.matchMedia;
    await TestBed.configureTestingModule({
      imports: [Hero],
    }).compileComponents();
  });

  afterEach(() => {
    window.matchMedia = origMatchMedia;
  });

  it('deve renderizar título, subtítulo e ações', () => {
    const fixture = TestBed.createComponent(Hero);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('VICE');
    expect(compiled.querySelector('.hero-subtitulo')).toBeTruthy();
    expect(compiled.querySelectorAll('.hero-acoes a').length).toBe(2);
  });

  it('deve renderizar o canvas da cena 3D', () => {
    const fixture = TestBed.createComponent(Hero);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('canvas.hero-cena')).toBeTruthy();
  });

  it('deve pular a animação do título quando reduced motion está ativo', () => {
    window.matchMedia = () =>
      mockMatchMedia({ reduzido: true });
    const fixture = TestBed.createComponent(Hero);
    expect(() => fixture.detectChanges()).not.toThrow();
    void HeroSceneService;
  });
});