import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeadService } from '../../core/lead.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  selector: 'app-newsletter',
  styleUrl: './newsletter.css',
  templateUrl: './newsletter.html',
})
export class Newsletter {
  private readonly leadService = inject(LeadService);

  readonly email = signal('');
  readonly enviado = signal(false);
  readonly enviando = signal(false);
  readonly erro = signal('');

  async assinar(): Promise<void> {
    // Trava o duplo clique: sem isso, dois submits disparam duas inserções.
    if (this.enviando()) return;

    const valor = this.email().trim();
    if (!valor) {
      this.erro.set('Informe um e-mail válido.');
      return;
    }

    this.enviando.set(true);
    this.erro.set('');

    const resultado = await this.leadService.assinar(valor);

    this.enviando.set(false);
    if (resultado.ok) {
      this.enviado.set(true);
      this.email.set('');
      return;
    }

    this.erro.set(resultado.mensagem ?? 'Não foi possível assinar agora. Tente de novo.');
  }
}
