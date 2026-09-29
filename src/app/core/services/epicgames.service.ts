import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of, tap } from 'rxjs';
import { FreeGame } from '../models/game.models';
import { CacheService } from './cache.service';

const EPIC_API = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions';

interface EpicElement {
  id: string;
  title: string;
  description: string;
  productSlug: string;
  price: { totalPrice: { fmtPrice: { originalPrice: number } } };
  keyImages: { type: string; url: string }[];
  promotions: { promotionalOffers: { promotionalOffers: { startDate: string; endDate: string; discountSetting: { discountPercentage: number } }[] }[] };
  seller: { name: string };
  developer: { name: string };
}

interface EpicResponse {
  data: { Catalog: { searchStore: { elements: EpicElement[] } } };
}

@Injectable({ providedIn: 'root' })
export class EpicGamesService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  getFreeGames(): FreeGame[] {
    const cacheKey = 'epic_free_games';
    const cached = this.cache.get<FreeGame[]>(cacheKey);
    if (cached) return cached;

    this.http.get<EpicResponse>(EPIC_API)
      .pipe(
        map(this.transformResponse),
        tap(games => this.cache.set(cacheKey, games, 60 * 60 * 1000)),
        catchError(() => of([]))
      )
      .subscribe(games => this.cache.set(cacheKey, games, 60 * 60 * 1000));

    return [];
  }

  getFreeGamesObservable() {
    const cacheKey = 'epic_free_games';
    const cached = this.cache.get<FreeGame[]>(cacheKey);
    if (cached) return of(cached);

    return this.http.get<EpicResponse>(EPIC_API).pipe(
      map(this.transformResponse),
      tap(games => this.cache.set(cacheKey, games, 60 * 60 * 1000)),
      catchError(() => of([]))
    );
  }

  private transformResponse(data: EpicResponse): FreeGame[] {
    const elements = data?.data?.Catalog?.searchStore?.elements || [];
    const now = new Date();

    return elements
      .filter((el: EpicElement) => {
        const promos = el.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
        if (!promos) return false;
        const start = new Date(promos.startDate);
        const end = new Date(promos.endDate);
        return start <= now && end >= now && promos.discountSetting?.discountPercentage === 0;
      })
      .map((el: EpicElement) => {
        const promos = el.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
        const originalPrice = el.price?.totalPrice?.fmtPrice?.originalPrice || 0;
        const image = el.keyImages?.find((img) => img.type === 'OfferImageWide' || img.type === 'Thumbnail')?.url || '';

        return {
          id: el.id,
          title: el.title,
          description: el.description?.slice(0, 200) || '',
          url: `https://www.epicgames.com/store/p/${el.productSlug || el.id}`,
          image_url: image,
          original_price: originalPrice / 100,
          current_price: 0,
          discount_percent: 100,
          start_date: promos?.startDate || now.toISOString(),
          end_date: promos?.endDate || now.toISOString(),
          platforms: ['Windows'],
          publisher: el.seller?.name || '',
          developer: el.developer?.name || '',
        };
      })
      .slice(0, 10);
  }
}