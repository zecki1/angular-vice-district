import { criarProxy } from './_lib/proxy';

/**
 * Proxy da NewsAPI (notícias). Opcional: sem `NEWSAPI_KEY` no ambiente o proxy
 * devolve o erro da origem e o app segue apenas com o Reddit.
 */
export default criarProxy({
  base: 'https://newsapi.org/v2',
  params: () => ({ apiKey: process.env.NEWSAPI_KEY }),
});
