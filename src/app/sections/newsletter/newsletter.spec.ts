import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Newsletter } from './newsletter';

describe('Newsletter', () => {
  let fixture: ComponentFixture<Newsletter>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Newsletter],
    }).compileComponents();
    fixture = TestBed.createComponent(Newsletter);
  });

  afterEach(() => localStorage.clear());

  it('deve exibir erro ao assinar com e-mail inválido', async () => {
    await fixture.componentInstance.assinar();
    fixture.detectChanges();

    expect(fixture.componentInstance.erro()).toBeTruthy();
    expect(fixture.componentInstance.enviado()).toBeFalse();
  });

  it('deve confirmar a assinatura com e-mail válido', async () => {
    fixture.componentInstance['email'].set('ana@exemplo.com');
    await fixture.componentInstance.assinar();
    fixture.detectChanges();

    expect(fixture.componentInstance.enviado()).toBeTrue();
    expect(fixture.componentInstance.email()).toBe('');
    expect((fixture.nativeElement as HTMLElement).querySelector('.newsletter-sucesso')).toBeTruthy();
  });

  it('deve travar o botão de envio enquanto a requisição está em voo', async () => {
    const componente = fixture.componentInstance;
    componente['email'].set('ana@exemplo.com');
    const pendente = componente.assinar();

    expect(componente.enviando()).toBeTrue();
    fixture.detectChanges();
    const botao = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );
    expect(botao?.disabled).toBeTrue();
    expect(botao?.textContent?.trim()).toContain('Assinando');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('form')?.getAttribute('aria-busy'),
    ).toBe('true');

    await pendente;
    expect(componente.enviando()).toBeFalse();
  });

  it('deve ignorar o duplo envio', async () => {
    const componente = fixture.componentInstance;
    componente['email'].set('ana@exemplo.com');

    await Promise.all([componente.assinar(), componente.assinar()]);

    // Duas inserções na mesma base de demonstração gerariam duplicata.
    expect(localStorage.getItem('zecki1-vd-leads')).toBe('[{"email":"ana@exemplo.com"}]');
  });

  it('deve marcar o campo como inválido quando há erro', async () => {
    await fixture.componentInstance.assinar();
    fixture.detectChanges();

    const input = (fixture.nativeElement as HTMLElement).querySelector('#newsletter-email');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-describedby')).toBe('newsletter-erro');
  });
});
