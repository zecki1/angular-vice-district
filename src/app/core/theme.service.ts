import { Injectable, signal } from '@angular/core';

type Tema = 'light' | 'dark';

const CHAVE_TEMA = 'zecki1-vd-tema';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly tema = signal<Tema>(this.inicial());

  private inicial(): Tema {
    const salvo = (localStorage.getItem(CHAVE_TEMA) as Tema | null) ?? null;
    if (salvo === 'light' || salvo === 'dark') return salvo;
    const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefereEscuro ? 'dark' : 'light';
  }

  alternar(): void {
    this.aplicar(this.tema() === 'dark' ? 'light' : 'dark');
  }

  definir(tema: Tema): void {
    this.aplicar(tema);
  }

  private aplicar(tema: Tema): void {
    this.tema.set(tema);
    localStorage.setItem(CHAVE_TEMA, tema);
    document.documentElement.setAttribute('data-theme', tema);
  }
}