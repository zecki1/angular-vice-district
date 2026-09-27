import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AccessibilityHub } from '../../accessibility-hub/accessibility-hub';
import { ThemeService } from '../../core/theme.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccessibilityHub],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header implements AfterViewInit {
  private readonly cabecalho = viewChild<ElementRef<HTMLElement>>('cabecalho');

  readonly temaService = inject(ThemeService);
  readonly tema = this.temaService.tema;

  alternarTema(): void {
    this.temaService.alternar();
  }

  ngAfterViewInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    ScrollTrigger.create({
      start: 40,
      end: 'max',
      onToggle: (self) => {
        this.cabecalho()?.nativeElement.classList.toggle('rolado', self.isActive);
      },
    });
  }
}