import { TestBed } from '@angular/core/testing';
import { Preloader } from './preloader';

describe('Preloader', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Preloader],
    }).compileComponents();
  });

  it('deve renderizar a barra e o contador', () => {
    const fixture = TestBed.createComponent(Preloader);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.preloader-barra')).toBeTruthy();
    expect(compiled.querySelector('.preloader-contador')).toBeTruthy();
  });

  it('deve iniciar a simulação de progresso com o alvo presente', () => {
    const fixture = TestBed.createComponent(Preloader);
    fixture.detectChanges();
    expect(() => fixture.componentInstance['simularProgresso']()).not.toThrow();
  });

  it('deve marcar como oculto ao concluir a animação', () => {
    const fixture = TestBed.createComponent(Preloader);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    comp['estado'].valor = 100;
    comp['atualizarProgresso'](true);
    expect(comp.progresso()).toBe(100);
    expect(comp.oculto()).toBeTrue();
  });
});