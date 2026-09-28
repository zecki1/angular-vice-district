import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, catchError, of, tap } from 'rxjs';
import { RawgGame, RawgGameDetail, RawgResponse, GameFilters } from '../models/game.models';
import { CacheService } from './cache.service';

const RAWG_BASE_URL = 'https://api.rawg.io/api';
const RAWG_KEY = 'b6f5c9d4e8f84e1a8c7b9d2f1a3e4b5c';

@Injectable({ providedIn: 'root' })
export class RawgService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  private readonly _games = signal<RawgGame[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _currentFilters = signal<GameFilters>({});
  private readonly _totalCount = signal(0);
  private readonly _currentPage = signal(1);

  readonly games = this._games.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly currentFilters = this._currentFilters.asReadonly();

  readonly hasGames = computed(() => this._games().length > 0);
  readonly totalPages = computed(() => Math.ceil(this._totalCount() / (this._currentFilters().page_size || 20)));

  private buildParams(filters: GameFilters): HttpParams {
    let params = new HttpParams().set('key', RAWG_KEY);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  getGames(filters: GameFilters = {}, useCache = true): void {
    const cacheKey = `games_${JSON.stringify(filters)}`;
    const cached = this.cache.get<RawgResponse<RawgGame>>(cacheKey);

    if (cached && useCache) {
      this._games.set(cached.results);
      this._totalCount.set(cached.count);
      this._currentPage.set(filters.page || 1);
      this._currentFilters.set(filters);
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    this.http.get<RawgResponse<RawgGame>>(`${RAWG_BASE_URL}/games`, { params: this.buildParams(filters) })
      .pipe(
        tap(response => {
          this.cache.set(cacheKey, response, 5 * 60 * 1000);
        }),
        catchError(err => {
          this._error.set('Falha ao carregar jogos. Tente novamente.');
          return of({ count: 0, results: [], next: null, previous: null });
        })
      )
      .subscribe(response => {
        this._games.set(response.results);
        this._totalCount.set(response.count);
        this._currentPage.set(filters.page || 1);
        this._currentFilters.set(filters);
        this._loading.set(false);
      });
  }

  loadMore(): void {
    const nextPage = this._currentPage() + 1;
    this.getGames({ ...this._currentFilters(), page: nextPage });
  }

  getGameDetail(id: number | string): RawgGameDetail | null {
    const cacheKey = `game_${id}`;
    const cached = this.cache.get<RawgGameDetail>(cacheKey);
    if (cached) return cached;

    this.http.get<RawgGameDetail>(`${RAWG_BASE_URL}/games/${id}`, { params: new HttpParams().set('key', RAWG_KEY) })
      .pipe(
        tap(game => this.cache.set(cacheKey, game, 30 * 60 * 1000)),
        catchError(() => of(null))
      )
      .subscribe(game => {
        if (game) this.cache.set(cacheKey, game, 30 * 60 * 1000);
      });

    return null;
  }

  getGameDetailObservable(id: number | string) {
    const cacheKey = `game_${id}`;
    const cached = this.cache.get<RawgGameDetail>(cacheKey);
    if (cached) return of(cached);

    return this.http.get<RawgGameDetail>(`${RAWG_BASE_URL}/games/${id}`, { params: new HttpParams().set('key', RAWG_KEY) })
      .pipe(
        tap(game => this.cache.set(cacheKey, game, 30 * 60 * 1000)),
        catchError(() => of(null))
      );
  }

  searchGames(query: string): void {
    this.getGames({ search: query, page_size: 20, ordering: '-added' });
  }

  getUpcomingGames(limit = 20): void {
    const today = new Date().toISOString().split('T')[0];
    const threeMonthsLater = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.getGames({ dates: `${today},${threeMonthsLater}`, ordering: 'released', page_size: limit });
  }

  getPopularGames(limit = 20): void {
    this.getGames({ ordering: '-rating', page_size: limit, metacritic: '80,100' });
  }

  getGamesByGenre(genreSlug: string, limit = 20): void {
    this.getGames({ genres: genreSlug, ordering: '-rating', page_size: limit });
  }

  getGamesByPlatform(platformSlug: string, limit = 20): void {
    this.getGames({ platforms: platformSlug, ordering: '-rating', page_size: limit });
  }

  getGenres() {
    const cacheKey = 'genres';
    const cached = this.cache.get<RawgResponse<{ id: number; name: string; slug: string }>>(cacheKey);
    if (cached) return of(cached);

    return this.http.get<RawgResponse<{ id: number; name: string; slug: string }>>(`${RAWG_BASE_URL}/genres`, {
      params: new HttpParams().set('key', RAWG_KEY)
    }).pipe(
      tap(res => this.cache.set(cacheKey, res, 60 * 60 * 1000)),
      catchError(() => of({ count: 0, results: [], next: null, previous: null }))
    );
  }

  getPlatforms() {
    const cacheKey = 'platforms';
    const cached = this.cache.get<RawgResponse<{ id: number; name: string; slug: string }>>(cacheKey);
    if (cached) return of(cached);

    return this.http.get<RawgResponse<{ id: number; name: string; slug: string }>>(`${RAWG_BASE_URL}/platforms`, {
      params: new HttpParams().set('key', RAWG_KEY)
    }).pipe(
      tap(res => this.cache.set(cacheKey, res, 60 * 60 * 1000)),
      catchError(() => of({ count: 0, results: [], next: null, previous: null }))
    );
  }

  getStores() {
    const cacheKey = 'stores';
    const cached = this.cache.get<RawgResponse<{ id: number; name: string; slug: string }>>(cacheKey);
    if (cached) return of(cached);

    return this.http.get<RawgResponse<{ id: number; name: string; slug: string }>>(`${RAWG_BASE_URL}/stores`, {
      params: new HttpParams().set('key', RAWG_KEY)
    }).pipe(
      tap(res => this.cache.set(cacheKey, res, 60 * 60 * 1000)),
      catchError(() => of({ count: 0, results: [], next: null, previous: null }))
    );
  }

  clearGames(): void {
    this._games.set([]);
    this._totalCount.set(0);
    this._currentPage.set(1);
  }
}