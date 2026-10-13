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
  // Aba padrão "recent": a fonte atual (FreeToGame) só traz jogos já lançados.
  readonly currentTab = signal<'upcoming' | 'recent'>('recent');

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
    // Uma única chamada: a fonte atual (FreeToGame) não tem datas futuras,
    // então ordenamos por lançamento e separamos "próximos" (vazio hoje) de
    // "recentes". Evita corrida entre dois requests no mesmo signal.
    this.rawg.getGames({ ordering: '-released', page_size: 20 });

    setTimeout(() => {
      const games = this.rawg.games();
      const hoje = new Date();
      this.upcomingGames.set(games.filter(g => g.released && new Date(g.released) >= hoje));
      this.recentReleases.set(games.filter(g => g.released && new Date(g.released) < hoje).slice(0, 12));
      // Sem "próximos" na fonte, abre direto na aba que tem conteúdo.
      if (!this.upcomingGames().length && this.recentReleases().length) {
        this.currentTab.set('recent');
      }
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