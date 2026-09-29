import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of, tap, forkJoin } from 'rxjs';
import { NewsArticle } from '../models/game.models';
import { CacheService } from './cache.service';

const NEWSAPI_KEY = 'your_newsapi_key';
const NEWSAPI_URL = 'https://newsapi.org/v2';
const REDDIT_BASE = 'https://www.reddit.com';
const GAMING_SUBREDDITS = ['gaming', 'games', 'pcgaming', 'PS5', 'XboxSeriesX', 'NintendoSwitch'];

interface NewsApiArticle {
  url: string;
  title: string;
  description: string | null;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string } | null;
}

interface NewsApiResponse {
  articles: NewsApiArticle[];
}

interface RedditPreviewImage {
  source?: { url?: string };
}

interface RedditChildData {
  id: string;
  title: string;
  selftext: string;
  permalink: string;
  preview?: { images?: RedditPreviewImage[] };
  thumbnail?: string;
  created_utc: number;
}

interface RedditListing {
  data?: { children?: { data: RedditChildData }[] };
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
    if (!NEWSAPI_KEY || NEWSAPI_KEY === 'your_newsapi_key') {
      return of([] as NewsArticle[]);
    }

    return this.http.get<NewsApiResponse>(`${NEWSAPI_URL}/top-headlines`, {
      params: {
        apiKey: NEWSAPI_KEY,
        category,
        language: 'pt',
        page: String(page),
        pageSize: String(pageSize),
      }
    }).pipe(
      map(res => (res.articles || []).map((a: NewsApiArticle): NewsArticle => ({
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
      this.http.get<RedditListing>(`${REDDIT_BASE}/r/${sub}/hot.json?limit=10`).pipe(
        map(res => (res.data?.children || []).map((child: { data: RedditChildData }): NewsArticle => {
          const data = child.data;
          return {
            id: `reddit_${data.id}`,
            title: data.title,
            description: data.selftext ? data.selftext.slice(0, 300) : '',
            url: `https://reddit.com${data.permalink}`,
            image_url: data.preview?.images?.[0]?.source?.url?.replace(/&/g, '&') || data.thumbnail || '',
            source: `r/${sub}`,
            source_url: `https://reddit.com/r/${sub}`,
            published_at: new Date(data.created_utc * 1000).toISOString(),
            category: 'reddit',
            tags: [sub, 'reddit'],
          };
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

    if (NEWSAPI_KEY && NEWSAPI_KEY !== 'your_newsapi_key') {
      this.http.get<NewsApiResponse>(`${NEWSAPI_URL}/everything`, {
        params: {
          apiKey: NEWSAPI_KEY,
          q: query,
          language: 'pt',
          sortBy: 'publishedAt',
          pageSize: '20',
        }
      }).pipe(
        map(res => (res.articles || []).map((a: NewsApiArticle): NewsArticle => ({
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
        tap(articles => this.cache.set(cacheKey, articles, 10 * 60 * 1000)),
        catchError(() => of([] as NewsArticle[]))
      ).subscribe({
        next: articles => {
          this._articles.set(articles);
          this._loading.set(false);
        },
        error: () => {
          this._error.set('Falha na busca');
          this._loading.set(false);
        }
      });
    } else {
      this.fetchFromReddit().subscribe({
        next: articles => {
          const filtered = articles.filter(a => 
            a.title.toLowerCase().includes(query.toLowerCase()) ||
            a.description.toLowerCase().includes(query.toLowerCase())
          );
          this._articles.set(filtered);
          this._loading.set(false);
        },
        error: () => {
          this._error.set('Falha na busca');
          this._loading.set(false);
        }
      });
    }
  }

  clearArticles(): void {
    this._articles.set([]);
  }
}