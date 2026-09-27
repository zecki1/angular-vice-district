import { TestBed } from '@angular/core/testing';
import { GalleryHorizontal } from './gallery-horizontal';
import { TmdbService } from '../../core/tmdb.service';

describe('GalleryHorizontal', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryHorizontal],
      providers: [
        {
          provide: TmdbService,
          useValue: { emCartaz: () => Promise.resolve([]) },
        },
      ],
    }).compileComponents();
  });

  it('deve renderizar os painéis da galeria', () => {
    const fixture = TestBed.createComponent(GalleryHorizontal);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const paineis = (fixture.nativeElement as HTMLElement).querySelectorAll('.galeria-painel');
    expect(paineis.length).toBe(comp.paineis.length);
  });
});