import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TrailerModalComponent } from './trailer-modal.component';

@Component({
  imports: [TrailerModalComponent],
  template: `<app-trailer-modal [aberto]="aberto()" [videoId]="videoId()" (aoFechar)="aberto.set(false)" />`,
})
class HostComponent {
  readonly aberto = signal(false);
  readonly videoId = signal('');
}

describe('TrailerModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  it('não renderiza nada quando está fechado', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('[data-testid="trailer-modal"]')).toBeNull();
  });

  it('renderiza dialog com aria-modal ao abrir', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.aberto.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-labelledby')).toBe('trailer-titulo');
  });

  it('Escape fecha o modal', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.aberto.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(fixture.componentInstance.aberto()).toBeFalse();
  });

  it('emite aoFechar no botão de fechar', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.aberto.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const botao = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[data-testid="trailer-fechar"]',
    );
    botao?.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.aberto()).toBeFalse();
  });

  it('clicar no backdrop fecha, clicar dentro não', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.aberto.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const raiz = fixture.nativeElement as HTMLElement;
    raiz.querySelector<HTMLElement>('[data-testid="trailer-modal"]')?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.aberto()).toBeTrue();

    raiz.querySelector<HTMLElement>('[data-testid="trailer-backdrop"]')?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.aberto()).toBeFalse();
  });

  it('bloqueia o scroll do body enquanto aberto e devolve ao fechar', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.aberto.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.body.style.overflow).toBe('hidden');

    fixture.componentInstance.aberto.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.body.style.overflow).toBe('');
  });

  it('mostra o estado de em montagem quando não há videoId', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.aberto.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const html = (fixture.nativeElement as HTMLElement).innerHTML;
    expect(html).toContain('trailer-sem-video');
    expect(html).not.toContain('trailer-iframe');
  });

  it('embute o iframe com youtube-nocookie quando há videoId', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.videoId.set('abc123');
    fixture.componentInstance.aberto.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const iframe = (fixture.nativeElement as HTMLElement).querySelector<HTMLIFrameElement>(
      '[data-testid="trailer-iframe"]',
    );
    expect(iframe?.src).toContain('youtube-nocookie.com/embed/abc123');
  });
});
