const { criarProxy } = require('./_lib/proxy');

/**
 * Proxy do Reddit (notícias de games). O Reddit responde 403/403-Blocked para
 * clientes sem `User-Agent` próprio, e não envia CORS.
 */
module.exports = criarProxy({
  base: 'https://www.reddit.com',
  headers: {
    'User-Agent': 'GameHub/1.0 (+https://github.com/zecki1/angular-vice-district)',
  },
});