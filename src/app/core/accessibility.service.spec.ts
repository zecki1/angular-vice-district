import { TestBed } from '@angular/core/testing';
import { AccessibilityService } from './accessibility.service';

describe('AccessibilityService', () => {
  let service: AccessibilityService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove(
      'modo-monocromatico',
      'modo-protanopia',
      'modo-deuteranopia',
      'modo-tritanopia',
      'modo-baixo-contraste',
      'font-dyslexic',
      'alto-contraste',
      'linhas-guia',
      'reduz-movimento',
    );
    document.documentElement.style.fontSize = '';
    service = TestBed.inject(AccessibilityService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve definir o modo de visão e aplicar a classe no html', () => {
    service.definirVisao('monocromatico');
    expect(service.visao()).toBe('monocromatico');
    expect(document.documentElement.classList.contains('modo-monocromatico')).toBeTrue();
    expect(localStorage.getItem('zecki1-vd-visao')).toBe('monocromatico');
  });

  it('deve alternar os toggles e aplicar as classes', () => {
    service.alternar('dislexia');
    expect(service.dislexia()).toBeTrue();
    expect(document.documentElement.classList.contains('font-dyslexic')).toBeTrue();

    service.alternar('altoContraste');
    expect(service.altoContraste()).toBeTrue();
    expect(document.documentElement.classList.contains('alto-contraste')).toBeTrue();
  });

  it('deve aumentar e diminuir a fonte dentro dos limites', () => {
    service.aumentarFonte();
    expect(service.tamanhoFonte()).toBe(13);
    expect(document.documentElement.style.fontSize).toBe('13px');

    for (let i = 0; i < 20; i++) service.aumentarFonte();
    expect(service.tamanhoFonte()).toBe(26);

    for (let i = 0; i < 20; i++) service.diminuirFonte();
    expect(service.tamanhoFonte()).toBe(12);
  });

  it('deve definir a fonte diretamente pelo range respeitando os limites', () => {
    service.definirFonte(18.6);
    expect(service.tamanhoFonte()).toBe(19);
    expect(document.documentElement.style.fontSize).toBe('19px');

    service.definirFonte(999);
    expect(service.tamanhoFonte()).toBe(26);

    service.definirFonte(-5);
    expect(service.tamanhoFonte()).toBe(12);
  });

  it('deve restaurar todas as preferências ao estado inicial', () => {
    service.definirVisao('protanopia');
    service.alternar('dislexia');
    service.alternar('linhasGuia');
    service.aumentarFonte();

    service.restaurarPreferencias();

    expect(service.visao()).toBe('nenhum');
    expect(service.dislexia()).toBeFalse();
    expect(service.linhasGuia()).toBeFalse();
    expect(service.reduzMovimento()).toBeFalse();
    expect(service.tamanhoFonte()).toBe(12);
    expect(document.documentElement.style.fontSize).toBe('12px');
  });

  it('deve limpar a classe de modo ao voltar para nenhum', () => {
    service.definirVisao('monocromatico');
    service.definirVisao('nenhum');
    expect(document.documentElement.classList.contains('modo-monocromatico')).toBeFalse();
  });

  it('deve ler preferências salvas no localStorage', () => {
    localStorage.setItem('zecki1-vd-visao', 'deuteranopia');
    localStorage.setItem('zecki1-vd-dislexia', '1');
    localStorage.setItem('zecki1-vd-fonte', '18');

    TestBed.resetTestingModule();
    const novo = TestBed.inject(AccessibilityService);
    expect(novo.visao()).toBe('deuteranopia');
    expect(novo.dislexia()).toBeTrue();
    expect(novo.tamanhoFonte()).toBe(18);
  });

  it('deve ignorar valores inválidos no localStorage', () => {
    localStorage.setItem('zecki1-vd-visao', 'nao-existe');
    localStorage.setItem('zecki1-vd-reduz-movimento', 'sim');
    localStorage.setItem('zecki1-vd-fonte', 'abc');

    TestBed.resetTestingModule();
    const novo = TestBed.inject(AccessibilityService);
    expect(novo.visao()).toBe('nenhum');
    expect(novo.reduzMovimento()).toBeFalse();
    expect(novo.tamanhoFonte()).toBe(12);
  });

  it('deve ignorar alternância com nome desconhecido', () => {
    expect(() => (service as unknown as { alternar: (n: string) => void }).alternar('fantasma')).not.toThrow();
  });
});