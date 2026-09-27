import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { LeadService, emailValido } from './lead.service';

describe('emailValido', () => {
  it('deve aceitar e-mails bem formados', () => {
    expect(emailValido('ana@exemplo.com')).toBeTrue();
    expect(emailValido('  ana.silva+tag@exemplo.com.br  ')).toBeTrue();
  });

  it('deve recusar e-mails mal formados', () => {
    expect(emailValido('')).toBeFalse();
    expect(emailValido('ana')).toBeFalse();
    expect(emailValido('ana@')).toBeFalse();
    expect(emailValido('ana@exemplo')).toBeFalse();
    expect(emailValido('@exemplo.com')).toBeFalse();
  });
});

describe('LeadService (modo demo)', () => {
  let service: LeadService;

  beforeEach(() => {
    localStorage.clear();
    (environment as { supabaseUrl: string }).supabaseUrl = '';
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeadService);
  });

  afterEach(() => localStorage.clear());

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve recusar e-mail inválido sem gravar nada', async () => {
    const resultado = await service.assinar('nao-e-email');

    expect(resultado.ok).toBeFalse();
    expect(resultado.mensagem).toBeTruthy();
    expect(service.listaLocal()).toEqual([]);
  });

  it('deve gravar o e-mail válido no localStorage', async () => {
    const resultado = await service.assinar('ana@exemplo.com');

    expect(resultado.ok).toBeTrue();
    expect(service.listaLocal()).toEqual([{ email: 'ana@exemplo.com' }]);
  });

  it('não deve duplicar o mesmo e-mail', async () => {
    await service.assinar('ana@exemplo.com');
    await service.assinar('ana@exemplo.com');

    expect(service.listaLocal().length).toBe(1);
  });

  it('deve tolerar JSON corrompido no localStorage', () => {
    localStorage.setItem('zecki1-vd-leads', '{quebrado');

    expect(service.listaLocal()).toEqual([]);
  });

  it('deve tratar JSON valido que nao e lista como vazio', () => {
    localStorage.setItem('zecki1-vd-leads', '{"email":"ana@exemplo.com"}');

    expect(service.listaLocal()).toEqual([]);
  });
});

describe('LeadService (modo backend/Supabase)', () => {
  let service: LeadService;
  let fetchSpy: jasmine.Spy;

  const ambienteOriginal = {
    supabaseUrl: environment.supabaseUrl,
    supabaseAnonKey: environment.supabaseAnonKey,
    supabaseProjectSlug: environment.supabaseProjectSlug,
  };

  beforeEach(() => {
    (environment as { supabaseUrl: string }).supabaseUrl = 'https://mock.supabase.co';
    (environment as { supabaseAnonKey: string }).supabaseAnonKey = 'anon-chave';
    (environment as { supabaseProjectSlug: string }).supabaseProjectSlug = 'gta-campaign';
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeadService);
  });

  afterEach(() => {
    Object.assign(environment, ambienteOriginal);
    localStorage.clear();
  });

  it('deve fazer POST em /rest/v1/leads com o slug do projeto', async () => {
    fetchSpy = spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 201 }));

    const resultado = await service.assinar('ana@exemplo.com');

    expect(resultado.ok).toBeTrue();
    const [url, init] = fetchSpy.calls.mostRecent().args as [string, RequestInit];
    expect(url).toBe('https://mock.supabase.co/rest/v1/leads');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      project_slug: 'gta-campaign',
      email: 'ana@exemplo.com',
    });
  });

  it('deve enviar apikey e Authorization no cabecalho', async () => {
    fetchSpy = spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 201 }));

    await service.assinar('ana@exemplo.com');

    const [, init] = fetchSpy.calls.mostRecent().args as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['apikey']).toBe('anon-chave');
    expect(headers['Authorization']).toBe('Bearer anon-chave');
  });

  it('deve reportar falha quando o Supabase responde erro', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 400 }));

    const resultado = await service.assinar('ana@exemplo.com');

    expect(resultado.ok).toBeFalse();
    expect(resultado.mensagem).toBeTruthy();
  });

  it('deve reportar falha quando a rede cai', async () => {
    spyOn(window, 'fetch').and.rejectWith(new Error('offline'));

    const resultado = await service.assinar('ana@exemplo.com');

    expect(resultado.ok).toBeFalse();
  });

  it('não deve gravar no localStorage no modo backend', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 201 }));

    await service.assinar('ana@exemplo.com');

    expect(service.listaLocal()).toEqual([]);
  });
});
