import { Injectable } from '@angular/core';

interface CacheEntry<T> {
  data: T;
  expires: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly memoryCache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set(key: string, data: unknown, ttl: number): void {
    this.memoryCache.set(key, { data, expires: Date.now() + ttl });
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
  }

  clear(): void {
    this.memoryCache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expires) this.memoryCache.delete(key);
    }
  }
}