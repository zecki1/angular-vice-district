import { TestBed } from '@angular/core/testing';
import { Prologo } from './prologo';
import { ParallaxDirective } from '../../shared/directives/parallax.directive';

describe('Prologo', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Prologo, ParallaxDirective],
    }).compileComponents();
  });

  it('deve renderizar título e passos do prólogo', () => {
    const fixture = TestBed.createComponent(Prologo);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.prologo-titulo')?.textContent).toContain('tudo começa');
    expect(compiled.querySelectorAll('.prologo-passo').length).toBe(
      fixture.componentInstance.passos.length,
    );
  });
});