import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { RawgService } from '../../core/services/rawg.service';
import { GameCardComponent } from '../../shared/components/game-card/game-card';
import { RawgGame } from '../../core/models/game.models';

interface Genre { id: number; name: string; slug: string; }
interface Platform { id: number; name: string; slug: string; }

@Component({
  selector: 'app-games',
  imports: [GameCardComponent],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css',
  host: { class: 'games-page' },
})
export class GamesComponent implements OnInit {
  readonly rawg = inject(RawgService);

  readonly games = signal<RawgGame[]>([]);
  readonly genres = signal<Genre[]>([]);
  readonly platforms = signal<Platform[]>([]);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly searchQuery = signal('');
  readonly selectedGenre = signal<string>('');
  readonly selectedPlatform = signal<string>('');
  readonly sortBy = signal<'-rating' | '-released' | '-added' | 'name'>('-rating');
  readonly currentPage = signal(1);

  readonly filteredGames = computed(() => this.games());
  readonly hasMore = computed(() => this.games().length > 0 && this.currentPage() * 20 < (this.rawg.totalCount() || 0));

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
    this.loadFilters();
    this.loadGames();
  }

  loadFilters(): void {
    this.rawg.getGenres().subscribe(res => this.genres.set(res.results));
    this.rawg.getPlatforms().subscribe(res => this.platforms.set(res.results.slice(0, 10)));
  }

  loadGames(reset = false): void {
    if (reset) {
      this.currentPage.set(1);
      this.games.set([]);
    } else {
      this.loadingMore.set(true);
    }

    this.rawg.getGames({
      page: this.currentPage(),
      page_size: 20,
      search: this.searchQuery() || undefined,
      genres: this.selectedGenre() || undefined,
      platforms: this.selectedPlatform() || undefined,
      ordering: this.sortBy(),
    });

    setTimeout(() => {
      const newGames = this.rawg.games();
      if (reset) {
        this.games.set(newGames);
      } else {
        this.games.update(prev => [...prev, ...newGames]);
      }
      this.loading.set(false);
      this.loadingMore.set(false);
    }, 500);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.loadGames(true);
  }

  onFilterChange(): void {
    this.loadGames(true);
  }

  onSortChange(sort: '-rating' | '-released' | '-added' | 'name'): void {
    this.sortBy.set(sort);
    this.loadGames(true);
  }

  loadMore(): void {
    this.currentPage.update(p => p + 1);
    this.loadGames(false);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedGenre.set('');
    this.selectedPlatform.set('');
    this.loadGames(true);
  }

  hasActiveFilters(): boolean {
    return !!this.searchQuery() || !!this.selectedGenre() || !!this.selectedPlatform();
  }
}