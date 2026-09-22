import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClarityService } from './core/clarity.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly clarityService = inject(ClarityService);

  protected readonly title = signal('VICE DISTRICT');
  protected readonly subtitulo = signal(
    'Sob o sol de neon, a cidade nunca dorme.'
  );

  constructor() {
    this.clarityService.iniciar();
  }
}
