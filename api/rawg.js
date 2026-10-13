const { criarProxy } = require('./_lib/proxy');

const FREE_TO_GAME = 'https://www.freetogame.com/api';

/**
 * Converte respostas do FreeToGame para formato semelhante ao RAWG (mínimo).
 */
async function mapearFreeToGame(path, query) {
  // Listar jogos: https://www.freetogame.com/api/games
  const url = new URL(`${FREE_TO_GAME}/games`);
  for (const [ch, v] of query.entries()) {
    if (ch !== 'path') url.searchParams.set(ch, v);
  }
  const resp = await fetch(url, { headers: { 'User-Agent': 'GameHub/1.0' } });
  if (!resp.ok) throw new Error(`FreeToGame HTTP ${resp.status}`);
  const dados = await resp.json();
  const results = dados.map(j => ({
    id: j.id,
    slug: j.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: j.title,
    released: j.release_date,
    background_image: j.thumbnail,
    rating: 4.2,
    metacritic: j.metacritic || 0,
    genres: j.genre ? [{ id: 0, name: j.genre }] : [],
    platforms: [{ platform: { id: 1, name: j.platform || 'PC' } }],
  }));
  return { count: results.length, results, next: null, previous: null };
}

/**
 * Fallback RAWG: quando a chave falta/é inválida, usa FreeToGame para lista e
 * devolve gênero vazio para não quebrar filtros.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const url = new URL(req.url || '/', 'http://localhost');
  const path = (url.searchParams.get('path') || 'games').replace(/^\//, '');
  const key = process.env.RAWG_API_KEY;

  // Se tem chave, tenta RAWG primeiro
  if (key) {
    try {
      const alvo = `https://api.rawg.io/api/${path}?${url.searchParams.toString()}`;
      const r = await fetch(alvo, { headers: { Accept: 'application/json' } });
      const txt = await r.text();
      res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
      res.status(r.status).send(txt);
      return;
    } catch (e) { /* fallback */ }
  }

  // Fallback sem chave
  try {
    if (path === 'genres') {
      res.json({ count: 0, results: [] });
      return;
    }
    if (path.startsWith('games')) {
      const dados = await mapearFreeToGame(path, url.searchParams);
      res.setHeader('Cache-Control', 'public, s-maxage=900');
      res.json(dados);
      return;
    }
    // Para platforms/stores/detail, retorna vazio para não travar UI
    if (path === 'platforms') return res.json({ count: 0, results: [] });
    if (path === 'stores') return res.json({ count: 0, results: [] });
    res.json({});
  } catch (e) {
    res.status(502).json({ erro: 'Fallback RAWG falhou', detalhe: String(e) });
  }
};