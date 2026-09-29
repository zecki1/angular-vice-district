#!/usr/bin/env node
/**
 * Gera `src/environments/ambiente.local.ts` a partir de `.env`.
 *
 * O arquivo gerado é gitignored, mas o script roda em `prestart`/`prebuild`/
 * `pretest`/`postinstall`: a CI sempre tem o arquivo, mesmo sem `.env`, e
 * nenhuma chave real entra no git (mesma estratégia do angular-ledger-bank).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'src', 'environments', 'ambiente.local.ts');

function lerDotEnv() {
  const caminho = join(raiz, '.env');
  if (!existsSync(caminho)) return {};

  const valores = {};
  for (const linha of readFileSync(caminho, 'utf8').split('\n')) {
    const semComentario = linha.split('#')[0].trim();
    if (!semComentario || semComentario.startsWith('CLARITY_') || semComentario.startsWith('BOT_')) {
      continue;
    }
    const separador = semComentario.indexOf('=');
    if (separador === -1) continue;
    const chave = semComentario.slice(0, separador).trim();
    const valor = semComentario.slice(separador + 1).trim().replace(/^["']|["']$/g, '');
    if (chave) valores[chave] = valor;
  }
  return valores;
}

const env = lerDotEnv();
const url = env.VITE_SUPABASE_URL ?? '';
const anonKey = env.VITE_SUPABASE_ANON_KEY ?? '';
const trailerVideoId = env.VITE_TRAILER_VIDEO_ID ?? '';
const supabaseProjectSlug = env.VITE_SUPABASE_PROJECT_SLUG ?? '';
const tmdbApiKey = env.VITE_TMDB_API_KEY ?? '';

// A base da API e a das imagens não são segredo: ficam aqui para o app não
// espalhar literais pela vitrine.
const tmdbBaseUrl = 'https://api.themoviedb.org/3';
const tmdbImagem = 'https://image.tmdb.org/t/p/';

const conteudo = `// Gerado por scripts/gerar-ambiente.mjs — NÃO COMMITAR.
// Sem .env o site sobe em modo demo (formulário resolve sem persistir).
export const ambienteLocal = {
  supabaseUrl: ${JSON.stringify(url)},
  supabaseAnonKey: ${JSON.stringify(anonKey)},
  supabaseProjectSlug: ${JSON.stringify(supabaseProjectSlug)},
  trailerVideoId: ${JSON.stringify(trailerVideoId)},
  tmdbApiKey: ${JSON.stringify(tmdbApiKey)},
  tmdbBaseUrl: ${JSON.stringify(tmdbBaseUrl)},
  tmdbImagem: ${JSON.stringify(tmdbImagem)},
};
`;

writeFileSync(destino, conteudo, 'utf8');
console.log(
  url && anonKey
    ? '[ambiente] Supabase configurado (credenciais de anon key).'
    : '[ambiente] Modo demo: sem credenciais do Supabase.',
);
