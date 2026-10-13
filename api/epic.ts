import { criarProxy } from './_lib/proxy';

/**
 * Proxy dos jogos grátis da semana (Epic Games Store). Endpoint público, mas a
 * resposta não traz CORS — o browser bloqueia a chamada direta.
 */
export default criarProxy({
  base: 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions',
});
