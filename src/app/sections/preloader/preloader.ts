import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import gsap from 'gsap';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-preloader',
  styleUrl: './preloader.css',
  templateUrl: './preloader.html',
})
export class Preloader implements OnInit {
  readonly progresso = signal(0);
  readonly oculto = signal(false);
  protected readonly estado = { valor: 0 };

  ngOnInit(): void {
    this.simularProgresso();
  }

  private simularProgresso(): void {
    const corpo = document.querySelector('.preloader-fundo');
    gsap.to(this.estado, {
      valor: 100,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => this.atualizarProgresso(false),
      onComplete: () => this.atualizarProgresso(true),
    });

    if (corpo) {
      gsap.to(corpo, { scale: 1.05, duration: 2.2, ease: 'power2.inOut' });
    }
  }

  protected atualizarProgresso(encerrar: boolean): void {
    this.progresso.set(Math.round(this.estado.valor));
    if (encerrar) {
      this.oculto.set(true);
    }
  }
}