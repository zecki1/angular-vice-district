export interface RawgGame {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings: Rating[];
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status: AddedByStatus;
  metacritic: number;
  playtime: number;
  suggestions_count: number;
  updated: string;
  user_game: unknown;
  reviews_count: number;
  saturated_color: string;
  dominant_color: string;
  platforms: PlatformWrapper[];
  parent_platforms: ParentPlatform[];
  genres: Genre[];
  stores: StoreWrapper[];
  tags: Tag[];
  esrb_rating: EsrbRating | null;
  short_screenshots: ShortScreenshot[];
}

export interface RawgGameDetail extends RawgGame {
  description: string;
  description_raw: string;
  website: string;
  developers: Developer[];
  publishers: Publisher[];
  screenshots: Screenshot[];
  movies: Movie[];
  achievements: Achievement[];
  parent_game: RawgGame | null;
  reddit_url: string;
  reddit_name: string;
  reddit_description: string;
  reddit_logo: string;
  reddit_count: number;
  twitch_count: number;
  youtube_count: number;
  reviews: Review[];
  community_updates: CommunityUpdate[];
  game_series: GameSeries[];
}

export interface RawgResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Rating {
  id: number;
  title: string;
  count: number;
  percent: number;
}

export interface AddedByStatus {
  yet: number;
  owned: number;
  beaten: number;
  toplay: number;
  dropped: number;
  playing: number;
}

export interface PlatformWrapper {
  platform: Platform;
  released_at: string;
  requirements_en: Requirements;
  requirements_ru: Requirements;
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  year_end: number | null;
  year_start: number | null;
  games_count: number;
  image_background: string;
}

export interface Requirements {
  minimum: string;
  recommended: string;
}

export interface ParentPlatform {
  platform: Platform;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

export interface StoreWrapper {
  id: number;
  store: Store;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  domain: string;
  games_count: number;
  image_background: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  language: string;
  games_count: number;
  image_background: string;
}

export interface EsrbRating {
  id: number;
  name: string;
  slug: string;
}

export interface ShortScreenshot {
  id: number;
  image: string;
}

export interface Developer {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

export interface Publisher {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

export interface Screenshot {
  id: number;
  image: string;
  width: number;
  height: number;
  is_deleted: boolean;
}

export interface Movie {
  id: number;
  name: string;
  preview: string;
  data: MovieData;
}

export interface MovieData {
  480: string;
  max: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  image: string;
  percent: number;
}

export interface CommunityUpdate {
  id: number;
  date: string;
  date_posted: string;
  description: string;
  type: string;
}

export interface GameSeries {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

export interface Review {
  id: number;
  text: string;
  rating: number;
  created: string;
  author: Author;
  game: number;
}

export interface Author {
  id: number;
  username: string;
  avatar: string;
  url: string;
}

export interface GameFilters {
  page?: number;
  page_size?: number;
  search?: string;
  genres?: string;
  platforms?: string;
  ordering?: string;
  dates?: string;
  tags?: string;
  metacritic?: string;
  parent_platforms?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  source: string;
  source_url: string;
  published_at: string;
  category: string;
  tags: string[];
}

export interface Deal {
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

export interface FreeGame {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  original_price: number;
  current_price: number;
  discount_percent: number;
  start_date: string;
  end_date: string;
  platforms: string[];
  publisher: string;
  developer: string;
}

export interface MiniGame {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: 'memory' | 'clicker' | 'quiz' | 'reaction';
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: number;
  high_score?: number;
}