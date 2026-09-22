import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('VICE DISTRICT');
  protected readonly subtitulo = signal(
    'Sob o sol de neon, a cidade nunca dorme.'
  );
}