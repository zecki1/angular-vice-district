import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { RawgService } from '../../core/services/rawg.service';
import { GameCardComponent } from '../../shared/components/game-card/game-card';
import { RawgGame } from '../../core/models/game.models';

@Component({
  selector: 'app-releases',
  imports: [GameCardComponent],
  templateUrl: './releases.component.html',
  styleUrl: './releases.component.css',
  host: { class: 'releases-page' },
})
export class ReleasesComponent implements OnInit {
  private readonly rawg = inject(RawgService);

  readonly upcomingGames = signal<RawgGame[]>([]);
  readonly recentReleases = signal<RawgGame[]>([]);
  readonly loading = signal(true);
  readonly currentTab = signal<'upcoming' | 'recent'>('upcoming');

  readonly groupedUpcoming = computed(() => {
    const groups = new Map<string, RawgGame[]>();
    for (const game of this.upcomingGames()) {
      if (!game.released) continue;
      const month = this.getMonth(game.released);
      if (!groups.has(month)) groups.set(month, []);
      groups.get(month)!.push(game);
    }
    return Array.from(groups.entries())
      .sort((a, b) => new Date(a[1][0].released).getTime() - new Date(b[1][0].released).getTime())
      .map(([month, games]) => ({ month, games }));
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.rawg.getUpcomingGames(20);
    this.rawg.getGames({ ordering: '-released', page_size: 20 });

    setTimeout(() => {
      const games = this.rawg.games();
      this.upcomingGames.set(games.filter(g => new Date(g.released) >= new Date()));
      this.recentReleases.set(games.filter(g => new Date(g.released) < new Date()).slice(0, 12));
      this.loading.set(false);
    }, 500);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  getMonth(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  }
}