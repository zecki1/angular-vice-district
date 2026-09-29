import { TestBed } from '@angular/core/testing';
import { LenisService } from './lenis.service';
import { mockMatchMedia } from '../test-helpers/match-media';

describe('LenisService', () => {
  let service: LenisService;
  let origMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    origMatchMedia = window.matchMedia;
    document.documentElement.classList.remove('overflow-hidden');
    delete document.documentElement.dataset['lenisPrevent'];
    service = TestBed.inject(LenisService);
    service['lenisInstance'] = undefined;
  });

  afterEach(() => {
    window.matchMedia = origMatchMedia;
    document.documentElement.classList.remove('overflow-hidden');
    delete document.documentElement.dataset['lenisPrevent'];
  });

  it('deve iniciar o smooth scroll no browser', () => {
    service.iniciar();
    expect(service['lenisInstance']).toBeDefined();
  });

  it('não deve duplicar a instância ao iniciar duas vezes', () => {
    service.iniciar();
    const primeira = service['lenisInstance'];
    service.iniciar();
    expect(service['lenisInstance']).toBe(primeira);
  });

  it('não deve iniciar quando reduced motion está ativo', () => {
    window.matchMedia = () => mockMatchMedia({ reduzido: true });
    service.iniciar();
    expect(service['lenisInstance']).toBeUndefined();
  });

  it('deve pausar e retomar o scroll', () => {
    service.iniciar();
    expect(() => service.parar()).not.toThrow();
    expect(() => service.iniciarScroll()).not.toThrow();
  });

  it('deve bloquear o scroll programaticamente', () => {
    service.iniciar();
    service.pararPara('modal-trailer');
    expect(document.documentElement.classList.contains('overflow-hidden')).toBeTrue();
    expect(document.documentElement.dataset['lenisPrevent']).toBe('modal-trailer');
  });

  it('deve rolar até um elemento existente', () => {
    const alvo = document.createElement('div');
    alvo.id = 'alvo-teste';
    document.body.appendChild(alvo);
    try {
      expect(() => service.rolarPara('#alvo-teste')).not.toThrow();
    } finally {
      alvo.remove();
    }
  });
});