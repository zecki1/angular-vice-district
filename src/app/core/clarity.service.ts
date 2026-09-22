import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';

type ClarityFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    clarity?: ClarityFn;
    clarityq?: unknown[][];
  }
}

@Injectable({ providedIn: 'root' })
export class ClarityService {
  private readonly platformId = inject(PLATFORM_ID);
  private iniciado = false;

  /** Inicia o Microsoft Clarity usando o snippet oficial (IIFE do loader). */
  iniciar(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const clarityId = environment.clarityId?.trim();
    if (!clarityId || this.iniciado) return;
    this.iniciado = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${clarityId}`;
    document.head.appendChild(script);
  }
}
