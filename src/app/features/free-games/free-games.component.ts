import { Component, OnInit, signal, inject } from '@angular/core';
import { EpicGamesService } from '../../core/services/epicgames.service';
import { FreeGame } from '../../core/models/game.models';

@Component({
  selector: 'app-free-games',
  templateUrl: './free-games.component.html',
  styleUrl: './free-games.component.css',
  host: { class: 'free-games-page' },
})
export class FreeGamesComponent implements OnInit {
  private readonly epic = inject(EpicGamesService);

  readonly freeGames = signal<FreeGame[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFreeGames();
  }

  loadFreeGames(): void {
    this.loading.set(true);
    this.error.set(null);

    this.epic.getFreeGamesObservable().subscribe({
      next: games => {
        this.freeGames.set(games);
        this.loading.set(false);
        if (games.length === 0) {
          this.error.set('Nenhum jogo grátis no momento. Volte na quinta-feira para novos jogos!');
        }
      },
      error: () => {
        this.error.set('Erro ao carregar jogos grátis. Tente novamente mais tarde.');
        this.loading.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  getTimeRemaining(endDate: string): string {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Expirado';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h restantes`;
    return `${hours}h restantes`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(price);
  }
}