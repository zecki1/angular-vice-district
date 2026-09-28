import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-trailer-modal',
  styleUrl: './trailer-modal.css',
  templateUrl: './trailer-modal.html',
})
export class TrailerModal {
  private readonly botaoFechar = viewChild<ElementRef<HTMLButtonElement>>('botaoFechar');
  readonly aberto = signal(false);

  abrir(): void {
    this.aberto.set(true);
    document.documentElement.style.overflow = 'hidden';
  }

  fechar(): void {
    this.aberto.set(false);
    document.documentElement.style.overflow = '';
  }

  fecharSeFundo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) {
      this.fechar();
    }
  }
}