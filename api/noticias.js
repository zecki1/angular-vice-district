const FEEDS = [
  { url: 'https://www.pcgamer.com/rss/', fonte: 'PC Gamer', home: 'https://www.pcgamer.com' },
  { url: 'https://www.rockpapershotgun.com/feed', fonte: 'Rock Paper Shotgun', home: 'https://www.rockpapershotgun.com' },
  { url: 'https://www.gamesradar.com/feeds/all/', fonte: 'GamesRadar+', home: 'https://www.gamesradar.com' },
  { url: 'https://feeds.ign.com/ign/all', fonte: 'IGN', home: 'https://www.ign.com' },
];

const AGENTE = 'GameHub/1.0 (+https://github.com/zecki1/angular-vice-district)';

function limpar(t) {
  return String(t)
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
  // `\\s` porque dentro de template literal a barra única vira a letra "s".
  const m = xml.match(new RegExp(`<${nome}[^>]*>([\\s\\S]*?)</${nome}>`, 'i'));
  return m ? m[1] : '';
}

function linkDoItem(item) {
  const bruto = tag('link', item);
  const href = bruto.match(/href="([^"]+)"/i);
  return limpar(href ? href[1] : bruto);
}

function imagemDoItem(item) {
  const m = item.match(/<media:content[^>]*\burl="([^"]+)"/i) ||
            item.match(/<media:thumbnail[^>]*\burl="([^"]+)"/i) ||
            item.match(/<enclosure[^>]*\burl="([^"]+)"[^>]*\btype="image/i) ||
            item.match(/<img[^>]*\bsrc="([^"]+)"/i);
  return m ? m[1] : '';
}

/* ---------------------------------------------------------------------------
 * Tradução EN → PT-BR via MyMemory (gratuita, sem chave).
 * - limite ~5k palavras/dia; por isso traduzimos só o lote final (~40 itens)
 * - com cache em memória para não repetir o mesmo texto na mesma invocação
 * - se a tradução falhar, mantém o original (a UI nunca fica vazia)
 * ------------------------------------------------------------------------- */
const MYMEMORY = 'https://api.mymemory.translated.net/get';
const cacheTraducao = new Map();

async function traduzirTexto(texto) {
  const bruto = String(texto || '').trim();
  if (!bruto || bruto.length < 3) return bruto;
  const chave = bruto.slice(0, 400);
  if (cacheTraducao.has(chave)) return cacheTraducao.get(chave);

  try {
    const url = `${MYMEMORY}?q=${encodeURIComponent(bruto.slice(0, 480))}&langpair=en|pt`;
    const r = await fetch(url, { headers: { 'User-Agent': AGENTE }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) return bruto;
    const dados = await r.json();
    const traduzido = dados?.responseData?.translatedText;
    if (r.status === 200 && traduzido && !/^MYMEMORY WARNING/i.test(traduzido)) {
      cacheTraducao.set(chave, traduzido);
      return traduzido;
    }
  } catch { /* segue com o original */ }
  return bruto;
}

/** Limita a concorrência para não estourar o rate limit da MyMemory. */
async function comLimite(lista, limite, fn) {
  const saida = new Array(lista.length);
  let cursor = 0;
  const trabalhador = async () => {
    while (cursor < lista.length) {
      const i = cursor++;
      saida[i] = await fn(lista[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limite, lista.length) }, trabalhador));
  return saida;
}

async function traduzirArtigo(artigo) {
  const [title, description] = await comLimite(
    [artigo.title, (artigo.description || '').slice(0, 300)],
    2,
    traduzirTexto,
  );
  return { ...artigo, title, description };
}

async function buscarFeed(f) {
  const r = await fetch(f.url, { headers: { 'User-Agent': AGENTE, Accept: 'application/rss+xml, application/xml, text/xml;q=0.9,*/*;q=0.8' }, signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(f.fonte+': HTTP '+r.status);
  const xml = await r.text();
  const blocos = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return blocos.slice(0,20).map(item => {
    const titulo = limpar(tag('title', item));
    const link = linkDoItem(item);
    const desc = limpar(tag('description', item)||tag('summary', item));
    const data = limpar(tag('pubDate', item)||tag('published', item)||tag('updated', item));
    const publicada = data ? new Date(data) : new Date();
    return {
      id: f.fonte+'_'+(link||titulo),
      title: titulo,
      description: desc.slice(0,300),
      url: link,
      image_url: imagemDoItem(item),
      source: f.fonte,
      source_url: f.home,
      published_at: (Number.isNaN(publicada.getTime())?new Date():publicada).toISOString(),
      category: 'noticias',
      tags: [f.fonte],
    };
  }).filter(a=>a.title&&a.url);
}

module.exports = async function handler(req,res) {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  if (req.method==='OPTIONS') { res.status(204).end(); return; }
  try {
    const r = await Promise.allSettled(FEEDS.map(buscarFeed));
    const brutas = r.filter(x=>x.status==='fulfilled').flatMap(x=>x.value).sort((a,b)=>new Date(b.published_at)-new Date(a.published_at)).slice(0,40);
    // Traduz só o lote final, com concorrência baixa para não estourar cota.
    const arts = await comLimite(brutas, 4, traduzirArtigo);
    res.setHeader('Cache-Control','public, s-maxage=600, stale-while-revalidate=1200');
    res.status(200).json(arts);
  } catch(e) { res.status(502).json({erro:'Falha feeds', detalhe:String(e)}); }
};
