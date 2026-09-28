import { Component, signal, computed, inject, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  host: { class: 'shell' },
})
export class Shell {
  private readonly router = inject(Router);

  readonly isSidebarOpen = signal(false);
  readonly isMobile = signal(false);
  readonly currentRoute = signal('');

  readonly navItems: NavItem[] = [
    { label: 'Início', icon: '🏠', route: '/' },
    { label: 'Notícias', icon: '📰', route: '/noticias' },
    { label: 'Lançamentos', icon: '🚀', route: '/lancamentos' },
    { label: 'Jogos', icon: '🎮', route: '/jogos' },
    { label: 'Ofertas', icon: '💰', route: '/ofertas' },
    { label: 'Grátis', icon: '🎁', route: '/gratis' },
    { label: 'Mini-Games', icon: '🕹️', route: '/mini-games' },
  ];

  constructor() {
    this.checkMobile();
    this.currentRoute.set(this.router.url);

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.currentRoute.set(e.url);
      if (this.isMobile()) this.isSidebarOpen.set(false);
    });
  }

  @HostListener('window:resize')
  checkMobile(): void {
    this.isMobile.set(window.innerWidth < 1024);
    if (!this.isMobile()) this.isSidebarOpen.set(true);
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    if (this.isMobile()) this.isSidebarOpen.set(false);
  }
}