import { ambienteLocal } from './ambiente.local';

/**
 * Ambiente de produção. Mesmas chaves do `environment.ts`, preenchidas pelas variáveis
 * de ambiente do Vercel no momento do build (§5 do planejamento).
 */
export const environment = {
  production: true,
  clarityId: ambienteLocal['CLARITY_PROJECT_ID'] ?? '',
  tmdbApiKey: ambienteLocal['VITE_TMDB_API_KEY'] ?? '',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImagem: 'https://image.tmdb.org/t/p/w300',
  supabaseUrl: ambienteLocal['VITE_SUPABASE_URL'] ?? '',
  supabaseAnonKey: ambienteLocal['VITE_SUPABASE_ANON_KEY'] ?? '',
  supabaseProjectSlug: ambienteLocal['VITE_SUPABASE_PROJECT_SLUG'] ?? 'gta-campaign',
};
