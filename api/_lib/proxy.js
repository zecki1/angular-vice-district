/**
 * Proxy compartilhado das funções serverless (`/api/*`) do GameHub.
 *
 * Por que existe: as APIs de origem (RAWG, CheapShark, Epic, Reddit, NewsAPI e
 * TMDB) **não enviam cabeçalhos de CORS** e algumas exigem chave de API ou um
 * `User-Agent` descritivo — que o browser proíbe definir. Chamadas direto do
 * browser falham sempre (CORS/400/401). Esta camada roda no servidor (Vercel
 * Functions), injeta o que falta e devolve a resposta já com CORS liberado,
 * escondendo as chaves do cliente.
 *
 * Convenção: o sub-caminho do recurso vem no parâmetro `path` (ex.:
 * `/api/rawg?path=games&page_size=20`). Os demais query params são repassados.
 *
 * CommonJS de propósito: o pacote não declara `"type": "module"`, então o
 * runtime do Vercel carrega as funções como CJS sem reclamar.
 */

const CABECALHOS_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function criarProxy(opcoes) {
  const parametro = opcoes.parametroCaminho ?? 'path';

  return async function handler(req, res) {
    for (const [chave, valor] of Object.entries(CABECALHOS_CORS)) {
      res.setHeader(chave, valor);
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const caminho = (url.searchParams.get(parametro) ?? '').replace(/^\/+/, '');
      url.searchParams.delete(parametro);

      for (const [chave, valor] of Object.entries(opcoes.params?.() ?? {})) {
        if (valor) url.searchParams.set(chave, valor);
      }

      const alvo = caminho ? `${opcoes.base}/${caminho}` : opcoes.base;
      const query = url.searchParams.toString();
      const destino = query ? `${alvo}?${query}` : alvo;

      const resposta = await fetch(destino, {
        headers: { Accept: 'application/json', ...(opcoes.headers ?? {}) },
        signal: AbortSignal.timeout(opcoes.timeoutMs ?? 15_000),
      });

      const corpo = await resposta.text();
      res.setHeader('Content-Type', resposta.headers.get('content-type') ?? 'application/json');
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
      res.status(resposta.status).send(corpo);
    } catch (erro) {
      res.status(502).json({ erro: 'Falha ao consultar a API de origem.', detalhe: String(erro) });
    }
  };
}

module.exports = { criarProxy };