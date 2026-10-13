const FREE_TO_GAME = 'https://www.freetogame.com/api';

async function mapearFreeToGame(path, query) {
  const url = new URL('https://www.freetogame.com/api/games');
  for (const [ch, v] of query.entries()) {
    if (ch !== 'path' && ch !== 'key') url.searchParams.set(ch, v);
  }
  const resp = await fetch(url, { headers: { 'User-Agent': 'GameHub/1.0' } });
  if (!resp.ok) throw new Error('FreeToGame HTTP '+resp.status);
  let dados=await resp.json(); if(dados.results) dados=dados.results; else if(!Array.isArray(dados)) dados=[];
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  const url = new URL(req.url || '/', 'http://localhost');
  const path = (url.searchParams.get('path') || 'games').replace(/^//, '');
  try {
    if (path === 'genres') { res.json({ count: 0, results: [] }); return; }
    if (path.startsWith('games')) {
      const dados = await mapearFreeToGame(path, url.searchParams);
      res.setHeader('Cache-Control', 'public, s-maxage=900');
      res.json(dados);
      return;
    }
    if (path === 'platforms') return res.json({ count: 0, results: [] });
    if (path === 'stores') return res.json({ count: 0, results: [] });
    res.json({});
  } catch (e) {
    res.status(502).json({ erro: 'Fallback RAWG falhou', detalhe: String(e) });
  }
};