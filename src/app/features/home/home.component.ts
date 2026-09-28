import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RawgService } from '../../core/services/rawg.service';
import { NewsService } from '../../core/services/news.service';
import { EpicGamesService } from '../../core/services/epicgames.service';
import { GameCardComponent } from '../../shared/components/game-card/game-card';
import { RawgGame, NewsArticle, FreeGame } from '../../core/models/game.models';

interface MiniGame {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  time: string;
  color: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, GameCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  host: { class: 'home-page' },
})
export class HomeComponent implements OnInit {
  readonly rawg = inject(RawgService);
  readonly news = inject(NewsService);
  readonly epic = inject(EpicGamesService);

  readonly featuredGames = signal<RawgGame[]>([]);
  readonly latestReleases = signal<RawgGame[]>([]);
  readonly popularGames = signal<RawgGame[]>([]);
  readonly latestNews = signal<NewsArticle[]>([]);
  readonly freeGames = signal<FreeGame[]>([]);
  readonly loading = signal(true);

  readonly miniGames = signal<MiniGame[]>([
    { id: 'memory', title: 'Memory Match', description: 'Teste sua memória combinando pares de ícones de jogos clássicos.', icon: '🧠', category: 'Memória', time: '2-5 min', color: 'purple' },
    { id: 'clicker', title: 'Cookie Clicker RPG', description: 'Clique, evolua e desbloqueie itens lendários. Um idle game viciante com tema gamer.', icon: '🍪', category: 'Idle/Clicker', time: '∞', color: 'pink' },
    { id: 'quiz', title: 'Game Trivia', description: 'Quanto você sabe sobre jogos? Responda perguntas sobre lançamentos, história e curiosidades.', icon: '❓', category: 'Quiz', time: '3-5 min', color: 'cyan' },
    { id: 'reaction', title: 'Reaction Test', description: 'Teste seus reflexos! Clique o mais rápido possível quando a cor mudar. Compare com amigos.', icon: '⚡', category: 'Reflexo', time: '1-2 min', color: 'orange' },
    { id: 'snake', title: 'Retro Snake', description: 'O clássico Snake com visual retrô. Coma pixels, cresça e não bata nas paredes!', icon: '🐍', category: 'Arcade', time: '2-10 min', color: 'green' },
    { id: '2048', title: '2048 Games Edition', description: 'Combine tiles de jogos famosos para chegar no tile 2048.', icon: '🔢', category: 'Puzzle', time: '5-15 min', color: 'gold' },
  ]);

  readonly skeletonGame = signal<RawgGame>({
    id: 0,
    slug: '',
    name: '',
    released: '',
    tba: false,
    background_image: '',
    rating: 0,
    rating_top: 0,
    ratings: [],
    ratings_count: 0,
    reviews_text_count: 0,
    added: 0,
    added_by_status: { yet: 0, owned: 0, beaten: 0, toplay: 0, dropped: 0, playing: 0 },
    metacritic: 0,
    playtime: 0,
    suggestions_count: 0,
    updated: '',
    user_game: null,
    reviews_count: 0,
    saturated_color: '',
    dominant_color: '',
    platforms: [],
    parent_platforms: [],
    genres: [],
    stores: [],
    tags: [],
    esrb_rating: null,
    short_screenshots: [],
  } as RawgGame);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.rawg.getPopularGames(6);
    this.rawg.getUpcomingGames(6);
    this.rawg.getGames({ ordering: '-released', page_size: 6 });
    this.news.fetchNews('gaming', 1, 4);
    this.freeGames.set(this.epic.getFreeGames());

    setTimeout(() => {
      this.featuredGames.set(this.rawg.games().slice(0, 1));
      this.popularGames.set(this.rawg.games().slice(1, 7));
      this.loading.set(false);
    }, 500);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}