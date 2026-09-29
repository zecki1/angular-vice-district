import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RawgGame } from '../../../core/models/game.models';
import { RatingComponent } from '../rating/rating';

@Component({
  selector: 'app-game-card',
  imports: [RouterLink, RatingComponent],
  templateUrl: './game-card.html',
  styleUrl: './game-card.css',
  host: { class: 'game-card' },
})
export class GameCardComponent {
  readonly game = input.required<RawgGame>();
  readonly variant = input<'default' | 'compact' | 'featured'>('default');
  readonly showPlatforms = input(true);
  readonly showGenres = input(true);
  readonly showRating = input(true);

  readonly platforms = computed(() => this.game().platforms?.slice(0, 3).map(p => p.platform.name) || []);
  readonly genres = computed(() => this.game().genres?.slice(0, 2).map(g => g.name) || []);
  readonly stores = computed(() => this.game().stores?.slice(0, 3).map(s => s.store.slug) || []);
  readonly metacritic = computed(() => this.game().metacritic || 0);
  readonly rating = computed(() => this.game().rating || 0);

  formatDate(dateStr: string): string {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}