import { ambienteLocal } from './ambiente.local';

/**
 * Ambiente de desenvolvimento. As chaves vêm de `src/environments/ambiente.local.ts`,
 * gerado por `scripts/gerar-ambiente.mjs` a partir do `.env` (gitignored).
 *
 * Sem `VITE_TMDB_API_KEY` a app segue funcionando: o `TmdbService` cai no mock local e
 * as seções que dependem da API entram no estado de erro/vazio já tratado no template.
 */
export const environment = {
  production: false,
  clarityId: ambienteLocal['CLARITY_PROJECT_ID'] ?? '',
  tmdbApiKey: ambienteLocal['VITE_TMDB_API_KEY'] ?? '',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImagem: 'https://image.tmdb.org/t/p/w300',
  supabaseUrl: ambienteLocal['VITE_SUPABASE_URL'] ?? '',
  supabaseAnonKey: ambienteLocal['VITE_SUPABASE_ANON_KEY'] ?? '',
  supabaseProjectSlug: ambienteLocal['VITE_SUPABASE_PROJECT_SLUG'] ?? 'gta-campaign',
};
