import { TestBed } from '@angular/core/testing';
import { Header } from './header';

describe('Header', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();
  });

  it('deve renderizar nav, botão de tema e hub de acessibilidade', () => {
    const fixture = TestBed.createComponent(Header);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav.cabecalho-nav')).toBeTruthy();
    expect(compiled.querySelector('.cabecalho-tema')).toBeTruthy();
    expect(compiled.querySelector('.hub-botao')).toBeTruthy();
  });

  it('deve alternar o tema ao clicar no botão', () => {
    const fixture = TestBed.createComponent(Header);
    const botao = fixture.nativeElement.querySelector('.cabecalho-tema') as HTMLButtonElement;
    const temaInicial = fixture.componentInstance.tema();
    botao.click();
    expect(fixture.componentInstance.tema()).toBe(temaInicial === 'dark' ? 'light' : 'dark');
  });
});