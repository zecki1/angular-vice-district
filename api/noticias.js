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
  const m = xml.match(new RegExp(`<${nome}[^>]*>([\s\S]*?)</${nome}>`, 'i'));
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

function traduzirSimples(texto) {
  if (!texto) return texto;
  const map = [
    ['News', 'Notícias'], ['Review', 'Análise'], ['Preview', 'Prévia'], ['Guide', 'Guia'],
    ['Best', 'Melhores'], ['How to', 'Como'], ['Tips', 'Dicas'], ['Update', 'Atualização'],
    ['Trailer', 'Trailer'], ['Release date', 'Data de lançamento'], ['Hands-on', 'Primeiras impressões'],
    ['Interview', 'Entrevista'], ['Rumor', 'Rumor'], ['Leaks', 'Vazamentos'], ['Patch notes', 'Notas do patch'],
    ['Free', 'Grátis'], ['Deals', 'Ofertas'], ['Sale', 'Promoção'], ['Early access', 'Acesso antecipado'],
    ['Console', 'Console'], ['PC', 'PC'], ['Xbox', 'Xbox'], ['PlayStation', 'PlayStation'], ['Switch', 'Switch'],
    ['PS5', 'PS5'], ['PS4', 'PS4'], ['Xbox Series', 'Xbox Series'], ['Nintendo Switch', 'Nintendo Switch'],
    ['is', 'é'], ['are', 'são'], ['will be', 'será'], ['launches', 'lança'], ['delayed', 'adiado'], ['cancelled', 'cancelado'],
    ['reveals', 'revela'], ['announced', 'anunciado'], ['confirmed', 'confirmado'], ['report', 'relata'], ['claims', 'afirma'],
    ['game', 'jogo'], ['games', 'jogos'], ['update', 'atualização'], ['players', 'jogadores'], ['developer', 'desenvolvedor'],
    ['publisher', 'publicadora'], ['release', 'lançamento'], ['remake', 'remake'], ['sequel', 'continuação'], ['spin-off', 'spin-off'],
  ];
  let out = texto;
  for (const [en, pt] of map) out = out.replace(new RegExp(`\b${en}\b`, 'gi'), pt);
  return out.charAt(0).toUpperCase() + out.slice(1);
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
      title: traduzirSimples(titulo),
      description: traduzirSimples(desc).slice(0,300),
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
    const arts = r.filter(x=>x.status==='fulfilled').flatMap(x=>x.value).sort((a,b)=>new Date(b.published_at)-new Date(a.published_at)).slice(0,40);
    res.setHeader('Cache-Control','public, s-maxage=600, stale-while-revalidate=1200');
    res.status(200).json(arts);
  } catch(e) { res.status(502).json({erro:'Falha feeds', detalhe:String(e)}); }
};
