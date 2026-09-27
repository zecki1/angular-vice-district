import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AccessibilityService, ModoVisao } from '../core/accessibility.service';
import { ThemeService } from '../core/theme.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-accessibility-hub',
  styleUrl: './accessibility-hub.css',
  templateUrl: './accessibility-hub.html',
})
export class AccessibilityHub {
  readonly a11y = inject(AccessibilityService);
  readonly temaService = inject(ThemeService);
  readonly aberto = signal(false);
  readonly tema = this.temaService.tema;

  readonly modos: { valor: ModoVisao; rotulo: string }[] = [
    { valor: 'nenhum', rotulo: 'Normal' },
    { valor: 'monocromatico', rotulo: 'Monocromático' },
    { valor: 'protanopia', rotulo: 'Protanopia' },
    { valor: 'deuteranopia', rotulo: 'Deuteranopia' },
    { valor: 'tritanopia', rotulo: 'Tritanopia' },
    { valor: 'baixo-contraste', rotulo: 'Baixo contraste' },
  ];

  abrir(): void {
    this.aberto.set(true);
  }

  fechar(): void {
    this.aberto.set(false);
  }
}