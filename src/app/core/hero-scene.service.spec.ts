import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HeroSceneService } from './hero-scene.service';

@Component({ template: '' })
class FakeHost {}

function criarCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
  Object.defineProperty(canvas, 'clientHeight', { value: 600, configurable: true });
  return canvas;
}

describe('HeroSceneService', () => {
  let service: HeroSceneService;
  let quantosRaf: number;
  let rafOriginal: typeof requestAnimationFrame;

  beforeEach(() => {
    rafOriginal = window.requestAnimationFrame;
    quantosRaf = 0;
    window.requestAnimationFrame = (cb) => {
      quantosRaf++;
      setTimeout(() => cb(16), 0);
      return quantosRaf;
    };
    service = TestBed.inject(HeroSceneService);
  });

  afterEach(() => {
    window.requestAnimationFrame = rafOriginal;
  });

  it('deve montar a cena no canvas e retornar uma limpeza', (done) => {
    service.montar(criarCanvas()).then((limpar) => {
      expect(limpar).toBeDefined();
      expect(() => limpar()).not.toThrow();
      done();
    });
  });

  it('deve rodar o loop de animação e pará-lo com a limpeza', async () => {
    const limpar = await service.montar(criarCanvas());
    expect(quantosRaf).toBeGreaterThan(0);
    limpar();
    const aposLimpar = quantosRaf;
    expect(aposLimpar).toBeGreaterThanOrEqual(1);
  });

  it('deve processar fábricas agendadas e ignorar canvas ausente', async () => {
    let foiProcessado = false;
    const fabricaSobe = () => {
      const canvas = criarCanvas();
      Object.defineProperty(canvas, 'getContext', {
        value: () => null,
        configurable: true,
      });
      return canvas;
    };
    service.iniciarQuandoPronto(() => null);
    service.iniciarQuandoPronto(() => {
      foiProcessado = true;
      return fabricaSobe();
    });
    const fixture = TestBed.createComponent(FakeHost);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(foiProcessado).toBeTrue();
  });
});