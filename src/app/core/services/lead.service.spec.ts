import { TestBed } from '@angular/core/testing';

import { LeadService } from './lead.service';

describe('LeadService', () => {
  let service: LeadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeadService);
  });

  it('começa ocioso, sem mensagem', () => {
    expect(service.status()).toBe('idle');
    expect(service.mensagem()).toBe('');
  });

  it('recusa e-mail inválido sem tocar no status de envio', async () => {
    const ok = await service.inscrever('nao-e-email');

    expect(ok).toBeFalse();
    expect(service.status()).toBe('erro');
    expect(service.mensagem()).toContain('Confira o e-mail');
  });

  it('resolve com sucesso no modo demo (sem credenciais)', async () => {
    // Sem `.env` não há VITE_SUPABASE_URL, então o serviço cai no modo demo.
    expect(service.demo).toBeTrue();

    const ok = await service.inscrever('ana@vice.district');

    expect(ok).toBeTrue();
    expect(service.status()).toBe('ok');
    expect(service.mensagem()).toContain('Inscrição registrada');
  });

  it('trim no e-mail antes de validar', async () => {
    const ok = await service.inscrever('   ana@vice.district   ');
    expect(ok).toBeTrue();
  });

  it('reset volta ao estado inicial', async () => {
    await service.inscrever('ana@vice.district');
    service.reset();

    expect(service.status()).toBe('idle');
    expect(service.mensagem()).toBe('');
  });
});
