import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Lead {
  email: string;
}

export interface ResultadoLead {
  ok: boolean;
  mensagem?: string;
}

export const TAMANHO_MINIMO_EMAIL = 6;

/** Regex simples de e-mail (mesmo padrão dos outros projetos do roadmap). */
export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

const CHAVE_LOCAL = 'zecki1-vd-leads';

@Injectable({ providedIn: 'root' })
export class LeadService {
  /**
   * Assina a lista de espera.
   * - Modo demo (sem `supabaseUrl`): grava no localStorage e simula latência.
   * - Modo backend (URL + anon key): `POST /rest/v1/leads` por `fetch` puro — puxar o
   *   client do Supabase para uma única inserção custaria bundle à toa.
   */
  async assinar(email: string): Promise<ResultadoLead> {
    const valor = email.trim();

    if (valor.length < TAMANHO_MINIMO_EMAIL || !emailValido(valor)) {
      return { ok: false, mensagem: 'Informe um e-mail válido.' };
    }

    if (environment.supabaseUrl) {
      try {
        await this.enviarParaSupabase(valor);
      } catch {
        return { ok: false, mensagem: 'Não foi possível assinar agora. Tente de novo.' };
      }
    } else {
      await this.simularLatencia();
      this.gravarLocal(valor);
    }

    return { ok: true };
  }

  listaLocal(): Lead[] {
    const cru = localStorage.getItem(CHAVE_LOCAL);
    if (!cru) return [];
    try {
      const dados = JSON.parse(cru) as Lead[];
      return Array.isArray(dados)
        ? dados.filter((d) => d && typeof d.email === 'string')
        : [];
    } catch {
      return [];
    }
  }

  private gravarLocal(email: string): void {
    const atual = this.listaLocal();
    if (atual.some((l) => l.email === email)) return;
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify([...atual, { email }]));
  }

  private async simularLatencia(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 180));
  }

  private async enviarParaSupabase(email: string): Promise<void> {
    const resposta = await fetch(`${environment.supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        apikey: environment.supabaseAnonKey,
        Authorization: `Bearer ${environment.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        project_slug: environment.supabaseProjectSlug,
        email,
      }),
    });
    if (!resposta.ok) {
      throw new Error(`Supabase respondeu ${resposta.status}`);
    }
  }
}
