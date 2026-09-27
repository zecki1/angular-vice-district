import { Component, inject, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClarityService } from './core/clarity.service';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { LenisService } from './core/lenis.service';

@Component({
  imports: [RouterOutlet, Header, Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly clarityService = inject(ClarityService);
  private readonly lenisService = inject(LenisService);

  constructor() {
    this.clarityService.iniciar();
    afterNextRender({
      write: () => {
        this.lenisService.iniciar();
      },
    });
  }
}