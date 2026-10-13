import { criarProxy } from './_lib/proxy';

/**
 * Proxy da RAWG (catálogo, lançamentos e detalhe de jogos).
 * A chave é lida de `RAWG_API_KEY` no ambiente do Vercel — nunca vai ao cliente.
 */
export default criarProxy({
  base: 'https://api.rawg.io/api',
  params: () => ({ key: process.env.RAWG_API_KEY }),
});
