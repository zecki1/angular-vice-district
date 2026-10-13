const { criarProxy } = require('./_lib/proxy');

/**
 * Proxy do CheapShark (ofertas). Não usa chave, mas exige um `User-Agent`
 * descritivo que o browser não pode enviar (header proibido) — daí o proxy.
 */
module.exports = criarProxy({
  base: 'https://www.cheapshark.com/api/1.0',
  headers: {
    'User-Agent': 'GameHub/1.0 (+https://github.com/zecki1/angular-vice-district)',
  },
});