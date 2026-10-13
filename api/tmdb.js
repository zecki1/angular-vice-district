const { criarProxy } = require('./_lib/proxy');

/**
 * Proxy do TMDB (vitrine cinematográfica). A chave vem de `TMDB_API_KEY` no
 * ambiente do Vercel, mantendo o cliente sem credenciais.
 */
module.exports = criarProxy({
  base: 'https://api.themoviedb.org/3',
  params: () => ({ api_key: process.env.TMDB_API_KEY }),
});