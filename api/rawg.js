/**
 * Catálogo de jogos do GameHub.
 *
 * A RAWG é a fonte ideal, mas hoje não libera criação de conta/chave — então o
 * proxy tenta a RAWG (se houver `RAWG_API_KEY`) e, quando ela falha, cai no
 * FreeToGame (gratuito, sem chave), que tem catálogo, gênero, plataforma,
 * imagem e data de lançamento.
 *
 * O FreeToGame é mapeado para o mesmo formato do RAWG que a UI consome, então
 * os services e componentes do Angular continuam sem mudar.
 *
 * Convenção: o sub-caminho vem em `path` (ex.: `/api/rawg?path=games&page_size=20`).
 */

const FREE_TO_GAME = 'https://www.freetogame.com/api';

const AGENTE = 'GameHub/1.0 (+https://github.com/zecki1/angular-vice-district)';

/** Traduções leves de gênero/plataforma para a UI (o resto fica no original). */
const GENEROS_PT = {
  Action: 'Ação', 'Action Game': 'Ação', 'Action RPG': 'RPG de ação', ARPG: 'RPG de ação',
  MMORPG: 'MMORPG', RPG: 'RPG', Shooter: 'Tiro', 'Battle Royale': 'Battle Royale',
  Card: 'Cartas', 'Card Game': 'Jogo de cartas', Strategy: 'Estratégia', Fighting: 'Luta',
  Sports: 'Esportes', Racing: 'Corrida', Simulation: 'Simulação', Adventure: 'Aventura',
  'Massively Multiplayer': 'Multijogador massivo', 'MOBA': 'MOBA', 'Idle': 'Idle',
};

const PLATAFORMAS_PT = {
  'PC (Windows)': 'PC', 'Web Browser': 'Navegador',
  'PC (Windows), Web Browser': 'PC + Navegador',
};

const slug = (texto) => String(texto || '')
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const genero = (bruto) => (bruto || '').trim();

/** Catálogo em memória por invocação (a lista do FreeToGame é pequena). */
let cacheCatalogo = { dados: null, em: 0 };
const TTL_CATALOGO = 10 * 60 * 1000;

async function carregarCatalogo() {
  if (cacheCatalogo.dados && Date.now() - cacheCatalogo.em < TTL_CATALOGO) {
    return cacheCatalogo.dados;
  }
  const resposta = await fetch(`${FREE_TO_GAME}/games`, {
    headers: { 'User-Agent': AGENTE },
    signal: AbortSignal.timeout(12_000),
  });
  if (!resposta.ok) throw new Error(`FreeToGame: HTTP ${resposta.status}`);
  const dados = await resposta.json();
  cacheCatalogo = { dados, em: Date.now() };
  return dados;
}

function plataformaDe(jogo) {
  const bruta = jogo.platform || 'PC';
  const nome = PLATAFORMAS_PT[bruta] ?? bruta.split(',')[0].trim();
  return { id: 1, name: nome, slug: 'pc', image: null, year_end: null, year_start: null, games_count: 0, image_background: '' };
}

function plataformaWrapper(jogo) {
  return {
    platform: plataformaDe(jogo),
    released_at: jogo.release_date || '',
    requirements_en: { minimum: '', recommended: '' },
    requirements_ru: { minimum: '', recommended: '' },
  };
}

/** Mapeia um jogo do FreeToGame para o formato `RawgGame` usado pela UI. */
function mapearJogo(jogo) {
  const g = genero(jogo.genre);
  return {
    id: jogo.id,
    slug: slug(jogo.title),
    name: jogo.title,
    released: jogo.release_date || '',
    tba: !jogo.release_date,
    background_image: jogo.thumbnail || '',
    rating: 4.2,
    rating_top: 5,
    ratings: [],
    ratings_count: 0,
    reviews_text_count: 0,
    added: 0,
    added_by_status: { yet: 0, owned: 0, beaten: 0, toplay: 0, dropped: 0, playing: 0 },
    metacritic: 0,
    playtime: 0,
    suggestions_count: 0,
    updated: jogo.release_date || '',
    user_game: null,
    reviews_count: 0,
    saturated_color: '',
    dominant_color: '',
    platforms: [plataformaWrapper(jogo)],
    parent_platforms: [{ platform: plataformaDe(jogo) }],
    genres: g ? [{ id: 0, name: GENEROS_PT[g] ?? g, slug: slug(g), games_count: 0, image_background: '' }] : [],
    stores: [],
    tags: [],
    esrb_rating: null,
    short_screenshots: [],
  };
}

function ordenar(lista, ordering) {
  const ordenado = [...lista];
  switch (ordering) {
    case '-released': ordenado.sort((a, b) => (b.released || '').localeCompare(a.released || '')); break;
    case 'released': ordenado.sort((a, b) => (a.released || '').localeCompare(b.released || '')); break;
    case 'name': ordenado.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); break;
    case '-added': ordenado.sort((a, b) => (b.released || '').localeCompare(a.released || '')); break;
    default: ordenado.sort((a, b) => b.rating - a.rating || b.id - a.id); break;
  }
  return ordenado;
}

/** Responde `path=games` do FreeToGame já filtrado/paginado/ordenado. */
async function responderGames(query) {
  const catalogo = await carregarCatalogo();
  let lista = catalogo.map(mapearJogo);

  const busca = (query.get('search') || '').trim().toLowerCase();
  if (busca) lista = lista.filter((j) => j.name.toLowerCase().includes(busca));

  const generoSlug = slug(query.get('genres') || '');
  if (generoSlug) lista = lista.filter((j) => j.genres.some((gg) => gg.slug === generoSlug));

  const plataformaSlug = slug(query.get('platforms') || '');
  if (plataformaSlug) {
    lista = lista.filter((j) => j.parent_platforms.some((pp) => pp.platform.slug === plataformaSlug));
  }

  const datas = (query.get('dates') || '').split(',');
  if (datas.length === 2) {
    const [de, ate] = datas;
    lista = lista.filter((j) => j.released && j.released >= de && j.released <= ate);
  }

  lista = ordenar(lista, query.get('ordering'));

  const page = Math.max(1, Number(query.get('page')) || 1);
  const pageSize = Math.max(1, Number(query.get('page_size')) || 20);
  const inicio = (page - 1) * pageSize;

  return {
    count: lista.length,
    results: lista.slice(inicio, inicio + pageSize),
    next: inicio + pageSize < lista.length ? 'next' : null,
    previous: page > 1 ? 'previous' : null,
  };
}

/** Responde `path=games/:id` com descrição longa do FreeToGame. */
async function responderDetalhe(id) {
  const resposta = await fetch(`${FREE_TO_GAME}/game?id=${encodeURIComponent(id)}`, {
    headers: { 'User-Agent': AGENTE },
    signal: AbortSignal.timeout(12_000),
  });
  if (!resposta.ok) return null;
  const jogo = await resposta.json();
  if (!jogo || !jogo.id) return null;

  const base = mapearJogo(jogo);
  const resumo = jogo.short_description || '';
  const completo = jogo.description || '';

  return {
    ...base,
    description: `<p>${resumo}</p>${completo ? `<p>${completo}</p>` : ''}`,
    description_raw: [resumo, completo].filter(Boolean).join('\n\n'),
    website: jogo.game_url || '',
    developers: jogo.developer
      ? [{ id: 0, name: jogo.developer, slug: slug(jogo.developer), games_count: 0, image_background: '' }]
      : [],
    publishers: jogo.publisher
      ? [{ id: 0, name: jogo.publisher, slug: slug(jogo.publisher), games_count: 0, image_background: '' }]
      : [],
    screenshots: jogo.thumbnail ? [{ id: 0, image: jogo.thumbnail, width: 0, height: 0, is_deleted: false }] : [],
    movies: [],
    achievements: [],
    parent_game: null,
    reddit_url: '', reddit_name: '', reddit_description: '', reddit_logo: '', reddit_count: 0,
    twitch_count: 0, youtube_count: 0, reviews: [], community_updates: [], game_series: [],
  };
}

/** Gêneros/plataformas distintos do catálogo (o FreeToGame não expõe endpoints). */
async function responderTaxonomia(tipo) {
  const catalogo = await carregarCatalogo();
  const vistos = new Map();
  const nomes = new Set();

  if (tipo === 'genres') {
    for (const jogo of catalogo) {
      const g = genero(jogo.genre);
      if (!g) continue;
      // Deduplica pelo nome exibido: `ARPG` e `Action RPG` viram o mesmo rótulo.
      const nome = GENEROS_PT[g] ?? g;
      if (nomes.has(nome)) continue;
      nomes.add(nome);
      vistos.set(nome, { id: vistos.size + 1, name: nome, slug: slug(g) });
    }
  } else {
    for (const jogo of catalogo) {
      const p = plataformaDe(jogo);
      if (nomes.has(p.name)) continue;
      nomes.add(p.name);
      vistos.set(p.name, { id: vistos.size + 1, name: p.name, slug: p.slug });
    }
  }

  return { count: vistos.size, results: Array.from(vistos.values()), next: null, previous: null };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const url = new URL(req.url ?? '/', 'http://localhost');
  const caminho = (url.searchParams.get('path') ?? 'games').replace(/^\/+/, '');

  try {
    let corpo;
    if (caminho === 'genres') corpo = await responderTaxonomia('genres');
    else if (caminho === 'platforms') corpo = await responderTaxonomia('platforms');
    else if (caminho === 'stores') corpo = { count: 0, results: [], next: null, previous: null };
    else if (/^games\/\d+$/.test(caminho)) corpo = await responderDetalhe(caminho.split('/')[1]);
    else if (caminho.startsWith('games')) corpo = await responderGames(url.searchParams);
    else corpo = { count: 0, results: [], next: null, previous: null };

    if (!corpo) {
      res.status(404).json({ erro: 'Jogo não encontrado.' });
      return;
    }

    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    res.status(200).json(corpo);
  } catch (erro) {
    res.status(502).json({ erro: 'Falha ao consultar o catálogo de jogos.', detalhe: String(erro) });
  }
};
