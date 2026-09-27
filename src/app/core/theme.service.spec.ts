import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { mockMatchMedia } from '../test-helpers/match-media';

describe('ThemeService', () => {
  let matchMediaOriginal: typeof window.matchMedia;

  beforeEach(() => {
    matchMediaOriginal = window.matchMedia;
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    window.matchMedia = matchMediaOriginal;
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('deve aplicar o tema salvo no atributo data-theme', () => {
    const service = TestBed.inject(ThemeService);
    service.definir('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(service.tema()).toBe('light');
  });

  it('deve alternar entre claro e escuro', () => {
    const service = TestBed.inject(ThemeService);
    service.alternar();
    expect(service.tema()).toBe('light');
    service.alternar();
    expect(service.tema()).toBe('dark');
  });

  it('deve persistir o tema no localStorage', () => {
    const service = TestBed.inject(ThemeService);
    service.definir('light');
    expect(localStorage.getItem('zecki1-vd-tema')).toBe('light');
  });

  it('deve restaurar o tema salvo ao recriar o serviço', () => {
    localStorage.setItem('zecki1-vd-tema', 'light');
    const novo = new ThemeService();
    expect(novo.tema()).toBe('light');
  });

  it('deve fallback para preferência do sistema quando nada está salvo', () => {
    window.matchMedia = () => mockMatchMedia({ reduzido: false }) as MediaQueryList;
    const service = new ThemeService();
    expect(service.tema()).toBe('light');
  });
});