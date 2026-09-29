import { TestBed } from '@angular/core/testing';
import { AccessibilityHub } from './accessibility-hub';

describe('AccessibilityHub', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove(
      'modo-monocromatico',
      'font-dyslexic',
      'alto-contraste',
      'linhas-guia',
    );
    await TestBed.configureTestingModule({
      imports: [AccessibilityHub],
    }).compileComponents();
  });

  it('deve abrir e fechar o painel', () => {
    const fixture = TestBed.createComponent(AccessibilityHub);
    const comp = fixture.componentInstance;
    comp.abrir();
    fixture.detectChanges();
    expect(comp.aberto()).toBeTrue();
    expect((fixture.nativeElement as HTMLElement).querySelector('.hub-acessibilidade')?.classList)
      .toContain('aberto');
    comp.fechar();
    fixture.detectChanges();
    expect(comp.aberto()).toBeFalse();
  });

  it('deve listar os modos de visão', () => {
    const fixture = TestBed.createComponent(AccessibilityHub);
    fixture.detectChanges();
    const radios = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'input[name="modo-visao"]',
    );
    expect(radios.length).toBe(6);
  });

  it('deve aplicar modo monocromático ao marcar o radio', () => {
    const fixture = TestBed.createComponent(AccessibilityHub);
    fixture.detectChanges();
    const radios = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'input[name="modo-visao"]',
    ) as NodeListOf<HTMLInputElement>;
    const monocromatico = Array.from(radios).find((r) => r.value === 'monocromatico');
    monocromatico?.click();
    expect(document.documentElement.classList.contains('modo-monocromatico')).toBeTrue();
  });

  it('deve controlar a fonte pelo range', () => {
    const fixture = TestBed.createComponent(AccessibilityHub);
    fixture.detectChanges();
    document.documentElement.style.fontSize = '';
    const range = (fixture.nativeElement as HTMLElement).querySelector(
      'input[type="range"].hub-fonte-range',
    ) as HTMLInputElement;
    expect(range).toBeTruthy();
    range.value = '18';
    range.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(document.documentElement.style.fontSize).toBe('18px');
    expect(range.value).toBe('18');
  });
});