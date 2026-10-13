import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of, tap, forkJoin } from 'rxjs';
import { NewsArticle } from '../models/game.models';
import { environment } from '../../../environments/environment';
import { CacheService } from './cache.service';

// Proxies serverless: a NewsAPI exige chave (guardada no servidor) e o Reddit
// nega clientes sem `User-Agent` próprio — nenhum dos dois envia CORS.
const NEWSAPI_URL = `${environment.apiProxyUrl}/api/newsapi`;
const REDDIT_BASE = `${environment.apiProxyUrl}/api/reddit`;
const GAMING_SUBREDDITS = ['gaming', 'games', 'pcgaming', 'PS5', 'XboxSeriesX', 'NintendoSwitch'];

interface NewsApiArticle {
  url: string;
  title: string;
  description: string | null;
  urlToImage: string | null;
  publishedAt: string;
  source?: { name?: string };
}

interface NewsApiResponse {
  articles?: NewsApiArticle[];
}

interface RedditChild {
  data: {
    id: string;
    title: string;
    selftext: string;
    permalink: string;
    preview?: { images?: { source?: { url?: string } }[] };
    thumbnail?: string;
    created_utc: number;
  };
}

interface RedditListingResponse {
  data?: { children?: RedditChild[] };
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);

  private readonly _articles = signal<NewsArticle[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly articles = this._articles.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  fetchNews(category = 'gaming', page = 1, pageSize = 20): void {
    const cacheKey = `news_${category}_${page}_${pageSize}`;
    const cached = this.cache.get<NewsArticle[]>(cacheKey);
    if (cached) {
      this._articles.set(cached);
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    forkJoin({
      newsapi: this.fetchFromNewsAPI(category, page, pageSize),
      reddit: this.fetchFromReddit(),
    }).subscribe({
      next: ({ newsapi, reddit }) => {
        const combined = [...newsapi, ...reddit]
          .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
          .slice(0, pageSize);
        this._articles.set(combined);
        this.cache.set(cacheKey, combined, 15 * 60 * 1000);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Falha ao carregar notícias');
        this._loading.set(false);
      }
    });
  }

  private fetchFromNewsAPI(category: string, page: number, pageSize: number) {
    return this.http.get<NewsApiResponse>(NEWSAPI_URL, {
      params: {
        path: 'top-headlines',
        category,
        language: 'pt',
        page: String(page),
        pageSize: String(pageSize),
      }
    }).pipe(
      map(res => (res.articles || []).map((a: NewsApiArticle) => ({
        id: `newsapi_${a.url}`,
        title: a.title,
        description: a.description || '',
        url: a.url,
        image_url: a.urlToImage || '',
        source: a.source?.name || 'NewsAPI',
        source_url: a.url,
        published_at: a.publishedAt,
        category,
        tags: [category],
      }))),
      catchError(() => of([] as NewsArticle[]))
    );
  }

  private fetchFromReddit() {
    const requests = GAMING_SUBREDDITS.map(sub => 
      this.http.get<RedditListingResponse>(REDDIT_BASE, { params: { path: `r/${sub}/hot.json`, limit: '10' } }).pipe(
        map(res => (res.data?.children || []).map((child: RedditChild) => {
          const data = child.data;
          return {
            id: `reddit_${data.id}`,
            title: data.title,
            description: data.selftext ? data.selftext.slice(0, 300) : '',
            url: `https://reddit.com${data.permalink}`,
            image_url: data.preview?.images?.[0]?.source?.url?.replace(/&/g, '&amp;') || data.thumbnail || '',
            source: `r/${sub}`,
            source_url: `https://reddit.com/r/${sub}`,
            published_at: new Date(data.created_utc * 1000).toISOString(),
            category: 'reddit',
            tags: [sub, 'reddit'],
          } as NewsArticle;
        })),
        catchError(() => of([] as NewsArticle[]))
      )
    );

    return forkJoin(requests).pipe(map(results => results.flat()));
  }

  searchNews(query: string): void {
    const cacheKey = `news_search_${query}`;
    const cached = this.cache.get<NewsArticle[]>(cacheKey);
    if (cached) {
      this._articles.set(cached);
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    this.http.get<NewsApiResponse>(NEWSAPI_URL, {
      params: {
        path: 'everything',
        q: query,
        language: 'pt',
        sortBy: 'publishedAt',
        pageSize: '20',
      }
    }).pipe(
      map(res => (res.articles || []).map((a: NewsApiArticle) => ({
        id: `newsapi_${a.url}`,
        title: a.title,
        description: a.description || '',
        url: a.url,
        image_url: a.urlToImage || '',
        source: a.source?.name || 'NewsAPI',
        source_url: a.url,
        published_at: a.publishedAt,
        category: 'search',
        tags: [query],
      }))),
      tap(articles => {
        if (articles.length) this.cache.set(cacheKey, articles, 10 * 60 * 1000);
      }),
      catchError(() => of([] as NewsArticle[]))
    ).subscribe(articles => {
      // Sem chave da NewsAPI (ou sem resultado) a busca cai no Reddit.
      if (articles.length) {
        this._articles.set(articles);
        this._loading.set(false);
        return;
      }
      this.buscarNoReddit(query);
    });
  }

  private buscarNoReddit(query: string): void {
    this.fetchFromReddit().subscribe({
      next: articles => {
        const alvo = query.toLowerCase();
        this._articles.set(
          articles.filter(a =>
            a.title.toLowerCase().includes(alvo) ||
            a.description.toLowerCase().includes(alvo),
          ),
        );
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Falha na busca');
        this._loading.set(false);
      }
    });
  }

  clearArticles(): void {
    this._articles.set([]);
  }
}