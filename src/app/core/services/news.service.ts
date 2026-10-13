import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of, tap, forkJoin } from 'rxjs';
import { NewsArticle } from '../models/game.models';
import { environment } from '../../../environments/environment';
import { CacheService } from './cache.service';

// Proxies serverless: a NewsAPI exige chave (guardada no servidor) e os RSS de
// games não enviam CORS — nenhuma das fontes funciona direto do browser.
const NEWSAPI_URL = `${environment.apiProxyUrl}/api/newsapi`;
const NOTICIAS_URL = `${environment.apiProxyUrl}/api/noticias`;

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
      feeds: this.fetchFromFeeds(),
    }).subscribe({
      next: ({ newsapi, feeds }) => {
        const combined = [...newsapi, ...feeds]
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

  private fetchFromFeeds() {
    // O proxy (`/api/noticias`) já devolve os artigos no formato `NewsArticle`.
    return this.http.get<NewsArticle[]>(NOTICIAS_URL).pipe(
      catchError(() => of([] as NewsArticle[]))
    );
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
      // Sem chave da NewsAPI (ou sem resultado) a busca cai nos feeds RSS.
      if (articles.length) {
        this._articles.set(articles);
        this._loading.set(false);
        return;
      }
      this.buscarNosFeeds(query);
    });
  }

  private buscarNosFeeds(query: string): void {
    this.fetchFromFeeds().subscribe({
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