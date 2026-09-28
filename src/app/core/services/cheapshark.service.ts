import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, catchError, of, tap } from 'rxjs';
import { Deal } from '../models/game.models';
import { CacheService } from './cache.service';

const CHEAPSHARK_BASE_URL = 'https://www.cheapshark.com/api/1.0';

interface CheapsharkDeal {
  id: string;
  game_id: number;
  game_name: string;
  game_slug: string;
  store_id: number;
  store_name: string;
  store_slug: string;
  price_new: number;
  price_old: number;
  discount_percent: number;
  currency: string;
  deal_url: string;
  expires_at: string | null;
  rating: number;
  metacritic: number;
  steam_rating_text: string;
  steam_rating_percent: number;
  steam_rating_count: number;
}

interface CheapsharkStore {
  storeID: string;
  storeName: string;
  isActive: number;
}

interface CheapsharkGameDeals {
  deals: CheapsharkDeal[];
}

interface CheapsharkOptions {
  storeID?: string;
  upperPrice?: number;
  lowerPrice?: number;
  onSale?: boolean;
  metacritic?: number;
  steamRating?: number;
  steamRatingCount?: number;
  AAA?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'Deal Rating' | 'Price' | 'Savings' | 'Recent' | 'Title' | 'Metacritic' | 'Steam Rating' | 'Release Date' | 'Steam Release Date';
  descending?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CheapsharkService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  getDeals(options: CheapsharkOptions = {}): any {
    const cacheKey = `deals_${JSON.stringify(options)}`;
    const cached = this.cache.get<CheapsharkDeal[]>(cacheKey);
    if (cached) return of(cached);

    const params = new HttpParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    return this.http.get<CheapsharkDeal[]>(`${CHEAPSHARK_BASE_URL}/deals`, { params })
      .pipe(
        tap(deals => this.cache.set(cacheKey, deals, 10 * 60 * 1000)),
        catchError(() => of([]))
      );
  }

  getGameDeals(gameID: string): any {
    const cacheKey = `game_deals_${gameID}`;
    const cached = this.cache.get<CheapsharkDeal[]>(cacheKey);
    if (cached) return of(cached);

    return this.http.get<CheapsharkGameDeals[]>(`${CHEAPSHARK_BASE_URL}/games`, { params: { id: gameID } })
      .pipe(
        map(res => res[0]?.deals || []),
        tap(deals => this.cache.set(cacheKey, deals as Deal[], 10 * 60 * 1000)),
        catchError(() => of([]))
      );
  }

  getStores(): any {
    const cacheKey = 'stores';
    const cached = this.cache.get<CheapsharkStore[]>(cacheKey);
    if (cached) return of(cached);

    return this.http.get<CheapsharkStore[]>(`${CHEAPSHARK_BASE_URL}/stores`)
      .pipe(
        tap(stores => this.cache.set(cacheKey, stores, 60 * 60 * 1000)),
        catchError(() => of([]))
      );
  }

  getGameLookup(title: string, exact = false): any {
    return this.http.get<CheapsharkDeal[]>(`${CHEAPSHARK_BASE_URL}/games`, {
      params: { title, exact: exact ? '1' : '0' }
    }).pipe(catchError(() => of([])));
  }
}