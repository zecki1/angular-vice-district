import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RawgService } from '../../core/services/rawg.service';
import { RatingComponent } from '../../shared/components/rating/rating';
import { RawgGameDetail, ShortScreenshot } from '../../core/models/game.models';

@Component({
  selector: 'app-game-detail',
  imports: [RouterLink, RatingComponent],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.css',
  host: { class: 'game-detail-page' },
})
export class GameDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly rawg = inject(RawgService);

  readonly game = signal<RawgGameDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly screenshots = signal<ShortScreenshot[]>([]);
  readonly currentScreenshot = signal(0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGame(+id);
    }
  }

  loadGame(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.rawg.getGameDetailObservable(id).subscribe({
      next: game => {
        if (game) {
          this.game.set(game);
          this.screenshots.set(game.screenshots || game.short_screenshots || []);
        } else {
          this.error.set('Jogo não encontrado');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar detalhes do jogo');
        this.loading.set(false);
      }
    });
  }

  nextScreenshot(): void {
    this.currentScreenshot.update(i => (i + 1) % this.screenshots().length);
  }

  prevScreenshot(): void {
    this.currentScreenshot.update(i => (i - 1 + this.screenshots().length) % this.screenshots().length);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  getPlatforms(): string[] {
    return this.game()?.platforms?.map(p => p.platform.name) || [];
  }

  getGenres(): string[] {
    return this.game()?.genres?.map(g => g.name) || [];
  }

  getStores(): string[] {
    return this.game()?.stores?.map(s => s.store.name) || [];
  }

  getDevelopers(): string[] {
    return this.game()?.developers?.map(d => d.name) || [];
  }

  getPublishers(): string[] {
    return this.game()?.publishers?.map(p => p.name) || [];
  }

  getTags(): string[] {
    return this.game()?.tags?.slice(0, 10).map(t => t.name) || [];
  }
}