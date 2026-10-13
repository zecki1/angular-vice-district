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
 */

export interface OpcoesProxy {
  /** Base da API de origem, sem barra final. */
  base: string;
  /** Nome do parâmetro de query que carrega o sub-caminho (padrão: `path`). */
  parametroCaminho?: string;
  /** Query params sempre injetados (ex.: chave lida do ambiente). */
  params?: () => Record<string, string | undefined>;
  /** Cabeçalhos extras enviados à origem (ex.: `User-Agent`). */
  headers?: Record<string, string>;
  /** Tempo máximo (ms) de espera da origem (padrão: 15s). */
  timeoutMs?: number;
}

const CABECALHOS_CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/* eslint-disable @typescript-eslint/no-explicit-any */

export function criarProxy(opcoes: OpcoesProxy) {
  const parametro = opcoes.parametroCaminho ?? 'path';

  return async function handler(req: any, res: any): Promise<void> {
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
