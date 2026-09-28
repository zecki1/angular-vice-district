import { TestBed } from '@angular/core/testing';
import { PreloaderService } from './preloader.service';

describe('PreloaderService', () => {
  let service: PreloaderService;

  beforeEach(() => {
    jasmine.clock().install();
    // Injetar pelo TestBed e não com `new`: o service usa `inject(DestroyRef)`
    // no inicializador, e chamar o construtor na mão lança NG0203.
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreloaderService);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    TestBed.resetTestingModule();
  });

  it('começa em 0 e não está pronto', () => {
    expect(service.progress()).toBe(0);
    expect(service.done()).toBeFalse();
  });

  it('markReady leva a 100 e marca pronto', () => {
    service.markReady();
    expect(service.progress()).toBe(100);
    expect(service.done()).toBeTrue();
  });

  it('sobe o progresso mas nunca passa de 90 antes do load', () => {
    service.start();
    jasmine.clock().tick(5000);

    expect(service.progress()).toBeGreaterThan(0);
    expect(service.progress()).toBeLessThanOrEqual(90);
    expect(service.done()).toBeFalse();
  });

  it('desacelera: o incremento encolhe conforme se aproxima de 90', () => {
    service.start();

    jasmine.clock().tick(120);
    const primeiro = service.progress();

    jasmine.clock().tick(120);
    const segundo = service.progress();

    jasmine.clock().tick(120);
    const terceiro = service.progress();

    const inc1 = segundo - primeiro;
    const inc2 = terceiro - segundo;
    expect(inc2).toBeLessThan(inc1);
  });

  it('markReady antes de start continua funcionando', () => {
    service.markReady();
    expect(service.done()).toBeTrue();
  });

  it('start duas vezes não cria dois intervalos', () => {
    service.start();
    service.start();
    service.start();

    // Um único tique de 120ms: passo = 90 * 0.08 = 7.2.
    // Com N intervalos seriam N passos, e o número não bateria.
    jasmine.clock().tick(120);
    expect(service.progress()).toBeCloseTo(7.2, 1);
  });

  it('markReady para o intervalo: nada mais avança depois de pronto', () => {
    service.start();
    service.markReady();
    expect(service.progress()).toBe(100);

    jasmine.clock().tick(2000);
    expect(service.progress()).toBe(100);
  });
});
