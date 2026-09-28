import { Component, OnInit, signal, inject } from '@angular/core';
import { NewsService } from '../../core/services/news.service';
import { NewsArticle } from '../../core/models/game.models';

@Component({
  selector: 'app-news',
  imports: [],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css',
  host: { class: 'news-page' },
})
export class NewsComponent implements OnInit {
  private readonly news = inject(NewsService);

  readonly articles = signal<NewsArticle[]>([]);
  readonly loading = signal(true);
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 12;

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.loading.set(true);
    this.news.fetchNews('gaming', this.currentPage(), this.pageSize);
    setTimeout(() => {
      this.articles.set(this.news.articles());
      this.loading.set(false);
    }, 300);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    if (query.trim()) {
      this.news.searchNews(query);
      setTimeout(() => {
        this.articles.set(this.news.articles());
        this.loading.set(false);
      }, 300);
    } else {
      this.loadNews();
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  loadMore(): void {
    this.currentPage.update(p => p + 1);
    this.news.fetchNews('gaming', this.currentPage(), this.pageSize);
    setTimeout(() => {
      this.articles.update(arr => [...arr, ...this.news.articles().slice(arr.length)]);
    }, 300);
  }
}