/**
 * Feed de notícias de games — agregação de RSS de veículos especializados.
 *
 * Sem chave de API. O Reddit foi abandonado como fonte: bloqueia IPs de
 * datacenter (Vercel) respondendo uma página HTML de "blocked" no lugar do JSON.
 * Devolve um array já no formato `NewsArticle` consumido pelo app.
 */

const FEEDS = [
  { url: 'https://www.pcgamer.com/rss/', fonte: 'PC Gamer', home: 'https://www.pcgamer.com' },
  { url: 'https://www.rockpapershotgun.com/feed', fonte: 'Rock Paper Shotgun', home: 'https://www.rockpapershotgun.com' },
  { url: 'https://www.gamesradar.com/feeds/all/', fonte: 'GamesRadar+', home: 'https://www.gamesradar.com' },
  { url: 'https://feeds.ign.com/ign/all', fonte: 'IGN', home: 'https://www.ign.com' },
];

const AGENTE = 'GameHub/1.0 (+https://github.com/zecki1/angular-vice-district)';

/** Remove tags/entidades e normaliza espaços de um trecho de XML. */
function limpar(texto) {
  return String(texto)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(nome, xml) {
  const encontrado = xml.match(new RegExp(`<${nome}[^>]*>([\\s\\S]*?)</${nome}>`, 'i'));
  return encontrado ? encontrado[1] : '';
}

function linkDoItem(item) {
  const bruto = tag('link', item);
  const href = bruto.match(/href="([^"]+)"/i);
  return limpar(href ? href[1] : bruto);
}

function imagemDoItem(item) {
  const encontrado =
    item.match(/<media:content[^>]*\burl="([^"]+)"/i) ||
    item.match(/<media:thumbnail[^>]*\burl="([^"]+)"/i) ||
    item.match(/<enclosure[^>]*\burl="([^"]+)"[^>]*\btype="image/i) ||
    item.match(/<img[^>]*\bsrc="([^"]+)"/i);
  return encontrado ? encontrado[1] : '';
}

async function buscarFeed(feed) {
  const resposta = await fetch(feed.url, {
    headers: {
      'User-Agent': AGENTE,
      Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!resposta.ok) throw new Error(`${feed.fonte}: HTTP ${resposta.status}`);

  const xml = await resposta.text();
  const blocos = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];

  return blocos
    .slice(0, 20)
    .map((item) => {
      const titulo = limpar(tag('title', item));
      const link = linkDoItem(item);
      const data = limpar(tag('pubDate', item) || tag('published', item) || tag('updated', item));
      const publicada = data ? new Date(data) : new Date();
      return {
        id: `${feed.fonte}_${link || titulo}`,
        title: titulo,
        description: limpar(tag('description', item) || tag('summary', item)).slice(0, 300),
        url: link,
        image_url: imagemDoItem(item),
        source: feed.fonte,
        source_url: feed.home,
        published_at: (Number.isNaN(publicada.getTime()) ? new Date() : publicada).toISOString(),
        category: 'noticias',
        tags: [feed.fonte],
      };
    })
    .filter((artigo) => artigo.title && artigo.url);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const resultados = await Promise.allSettled(FEEDS.map(buscarFeed));
    const artigos = resultados
      .filter((resultado) => resultado.status === 'fulfilled')
      .flatMap((resultado) => resultado.value)
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 40);

    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    res.status(200).json(artigos);
  } catch (erro) {
    res.status(502).json({ erro: 'Falha ao carregar os feeds de notícias.', detalhe: String(erro) });
  }
};