import { TestBed } from '@angular/core/testing';
import { TrailerModal } from './trailer-modal';

describe('TrailerModal', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrailerModal],
    }).compileComponents();
  });

  afterEach(() => {
    document.documentElement.style.overflow = '';
  });

  it('deve abrir o modal e travar o scroll', () => {
    const fixture = TestBed.createComponent(TrailerModal);
    const comp = fixture.componentInstance;
    comp.abrir();
    fixture.detectChanges();
    expect(comp.aberto()).toBeTrue();
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect((fixture.nativeElement as HTMLElement).querySelector('.modal')).toBeTruthy();
  });

  it('deve fechar o modal e liberar o scroll', () => {
    const fixture = TestBed.createComponent(TrailerModal);
    const comp = fixture.componentInstance;
    comp.abrir();
    comp.fechar();
    fixture.detectChanges();
    expect(comp.aberto()).toBeFalse();
    expect((fixture.nativeElement as HTMLElement).querySelector('.modal')).toBeNull();
  });

  it('não deve fechar ao clicar dentro do conteúdo', () => {
    const fixture = TestBed.createComponent(TrailerModal);
    const comp = fixture.componentInstance;
    comp.abrir();
    fixture.detectChanges();
    const modal = (fixture.nativeElement as HTMLElement).querySelector('.modal');
    const conteudo = (fixture.nativeElement as HTMLElement).querySelector('.modal-conteudo');
    const evento = new MouseEvent('click', { bubbles: false });
    Object.defineProperty(evento, 'target', { value: conteudo });
    Object.defineProperty(evento, 'currentTarget', { value: modal });
    comp.fecharSeFundo(evento);
    expect(comp.aberto()).toBeTrue();
  });

  it('deve fechar ao clicar no fundo do modal', () => {
    const fixture = TestBed.createComponent(TrailerModal);
    const comp = fixture.componentInstance;
    comp.abrir();
    fixture.detectChanges();
    const modal = (fixture.nativeElement as HTMLElement).querySelector('.modal');
    const evento = new MouseEvent('click', { bubbles: false });
    Object.defineProperty(evento, 'target', { value: modal });
    Object.defineProperty(evento, 'currentTarget', { value: modal });
    comp.fecharSeFundo(evento);
    expect(comp.aberto()).toBeFalse();
    expect(document.documentElement.style.overflow).toBe('');
  });
});