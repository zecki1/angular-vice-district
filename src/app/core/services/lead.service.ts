import { Injectable, inject, signal } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { environment } from '../../../environments/environment';
import { NEWSLETTER_SLUG } from '../content';

export type LeadStatus = 'idle' | 'enviando' | 'ok' | 'erro';

interface LeadPayload {
  email: string;
  slug: string;
  origem: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmailValido(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/**
 * Sem `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` o formulário não quebra:
 * ele resolve como sucesso e o evento é registrado no console. Serve para a
 * campanha rodar local e em preview sem credencial (o problema do ledger,
 * resolvido igual aqui).
 */
@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _status = signal<LeadStatus>('idle');
  private readonly _mensagem = signal('');

  readonly status = this._status.asReadonly();
  readonly mensagem = this._mensagem.asReadonly();

  get demo(): boolean {
    return !environment.supabaseUrl || !environment.supabaseAnonKey;
  }

  reset(): void {
    this._status.set('idle');
    this._mensagem.set('');
  }

  async inscrever(email: string, origem = 'newsletter'): Promise<boolean> {
    const limpo = email.trim();

    if (!isEmailValido(limpo)) {
      this._status.set('erro');
      this._mensagem.set('Confira o e-mail: parece faltar alguma coisa.');
      return false;
    }

    this._status.set('enviando');
    this._mensagem.set('');

    const payload: LeadPayload = { email: limpo, slug: NEWSLETTER_SLUG, origem };

    if (this.demo || !isPlatformBrowser(this.platformId)) {
      await new Promise((r) => setTimeout(r, 450));
      if (isPlatformBrowser(this.platformId)) {
        console.info('[vice-district] lead (modo demo, não persistido)', payload);
      }
      this._status.set('ok');
      this._mensagem.set('Inscrição registrada. Nos vemos no lançamento.');
      return true;
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
        auth: { persistSession: false },
      });

      const { error } = await client.from('leads').insert(payload);
      if (error) throw error;

      this._status.set('ok');
      this._mensagem.set('Inscrição registrada. Nos vemos no lançamento.');
      return true;
    } catch (erro) {
      console.error('[vice-district] falha ao gravar lead', erro);
      this._status.set('erro');
      this._mensagem.set('Não conseguimos salvar agora. Tente de novo em instantes.');
      return false;
    }
  }
}
