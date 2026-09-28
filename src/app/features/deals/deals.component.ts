import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CheapsharkService } from '../../core/services/cheapshark.service';
import { Deal } from '../../core/models/game.models';

interface CheapsharkStore {
  storeID: string;
  storeName: string;
  isActive: number;
}

@Component({
  selector: 'app-deals',
  imports: [RouterLink],
  templateUrl: './deals.component.html',
  styleUrl: './deals.component.css',
  host: { class: 'deals-page' },
})
export class DealsComponent implements OnInit {
  private readonly cheapshark = inject(CheapsharkService);

  readonly deals = signal<Deal[]>([]);
  readonly stores = signal<CheapsharkStore[]>([]);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly selectedStore = signal<string>('');
  readonly sortBy = signal<'Deal Rating' | 'Price' | 'Savings' | 'Recent'>('Deal Rating');
  readonly currentPage = signal(0);

  readonly filteredDeals = computed(() => {
    let result = this.deals();
    if (this.selectedStore()) {
      result = result.filter(d => String(d.store_id) === this.selectedStore());
    }
    return result;
  });

  ngOnInit(): void {
    this.loadStores();
    this.loadDeals();
  }

  loadStores(): void {
    this.cheapshark.getStores().subscribe((stores: CheapsharkStore[]) => this.stores.set(stores));
  }

  loadDeals(reset = false): void {
    if (reset) {
      this.currentPage.set(0);
      this.deals.set([]);
    } else {
      this.loadingMore.set(true);
    }

    this.cheapshark.getDeals({
      pageNumber: this.currentPage(),
      pageSize: 20,
      sortBy: this.sortBy(),
      descending: true,
      onSale: true,
    }).subscribe((deals: Deal[]) => {
      if (reset) {
        this.deals.set(deals);
      } else {
        this.deals.update(prev => [...prev, ...deals]);
      }
      this.loading.set(false);
      this.loadingMore.set(false);
    });
  }

  onSortChange(sort: 'Deal Rating' | 'Price' | 'Savings' | 'Recent'): void {
    this.sortBy.set(sort);
    this.loadDeals(true);
  }

  onStoreChange(storeId: string): void {
    this.selectedStore.set(storeId);
    this.loadDeals(true);
  }

  loadMore(): void {
    this.currentPage.update(p => p + 1);
    this.loadDeals(false);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(price);
  }

  getDiscountBadge(discount: number): string {
    if (discount >= 75) return 'badge-pink';
    if (discount >= 50) return 'badge-purple';
    if (discount >= 25) return 'badge-cyan';
    return 'badge-green';
  }

  getStoreName(storeId: string | number): string {
    const id = String(storeId);
    const store = this.stores().find(s => String(s.storeID) === id);
    return store?.storeName || 'Loja';
  }
}