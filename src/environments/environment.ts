import { ambienteLocal } from './ambiente.local';

export const environment = {
  production: false,
  clarityId: '',
  trailerVideoId: ambienteLocal.trailerVideoId,
  supabaseUrl: ambienteLocal.supabaseUrl,
  supabaseAnonKey: ambienteLocal.supabaseAnonKey,
};
