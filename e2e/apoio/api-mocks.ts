import { type Page } from '@playwright/test';

/**
 * Mocks das APIs externas consumidas pelo GameHub (RAWG, CheapShark, NewsAPI,
 * Reddit, Epic e TMDB).
 *
 * Os specs E2E não devem depender de cota de terceiros, de chave válida nem de
 * rede: o contrato (formato das respostas) é o que importa. Reaproveitado pelos
 * specs de acessibilidade e de screenshots — o smoke mantém os mocks próprios
 * para documentar cada fluxo.
 *
 * O `id` 1 é o mesmo usado no `e2e/smoke.spec.ts` (`jogoFake.id`), então a rota
 * `/jogo/1` é o detalhe "real" do catálogo mockado.
 */

export const ID_JOGO_MOCK = 1;

const jogoFake = {
  id: ID_JOGO_MOCK,
  slug: 'jogo-de-teste',
  name: 'Jogo de Teste',
  released: '2020-01-01',
  tba: false,
  background_image: 'https://placehold.co/460x215/1a1a2e/ffffff?text=Jogo',
  rating: 4.5,
  rating_top: 5,
  ratings: [{ id: 5, title: 'exceptional', count: 100, percent: 60 }],
  ratings_count: 1200,
  reviews_text_count: 12,
  added: 500,
  added_by_status: { yet: 10, owned: 20, beaten: 30, toplay: 40, dropped: 5, playing: 8 },
  metacritic: 88,
  playtime: 0,
  suggestions_count: 3,
  updated: '2024-01-01T00:00:00',
  user_game: null,
  reviews_count: 12,
  saturated_color: '0a0a0a',
  dominant_color: '1a1a2e',
  platforms: [{ platform: { id: 1, name: 'PC', slug: 'pc' } }],
  parent_platforms: [{ platform: { id: 1, name: 'PC', slug: 'pc' } }],
  genres: [{ id: 1, name: 'Action', slug: 'action' }],
  stores: [{ store: { id: 1, name: 'Steam', slug: 'steam' } }],
  tags: [{ id: 1, name: 'Singleplayer', slug: 'singleplayer' }],
  short_screenshots: [{ id: -1, image: 'https://placehold.co/460x215/1a1a2e/ffffff?text=Shot' }],
  esrb_rating: null,
};

const jogosFake = [jogoFake, { ...jogoFake, id: 2, name: 'Segundo Jogo' }];

const detailFake = {
  ...jogoFake,
  description: 'Um jogo de teste usado pelos fluxos E2E.',
  description_raw: 'Um jogo de teste usado pelos fluxos E2E.',
  website: '',
  developers: [{ id: 1, name: 'Estúdio Teste' }],
  publishers: [{ id: 1, name: 'Publicadora Teste' }],
  screenshots: [{ id: 1, image: 'https://placehold.co/800x450/1a1a2e/ffffff?text=Screenshot' }],
  movies: [],
  achievements: [],
  parent_game: null,
  background_color: '#101018',
};

const dealFake = {
  internalName: 'Jogo de Teste',
  title: 'Jogo de Teste',
  metacriticLink: '',
  dealID: 'abc',
  storeID: '1',
  gameID: '1',
  salePrice: '19,99',
  normalPrice: '99,99',
  isOnSale: true,
  savings: '80',
  metacriticScore: '88',
  steamRatingText: 'Muito Positivo',
  steamRating: '95',
  steamRatingCount: 1200,
  steamAppID: '1',
  releaseDate: '2020-01-01',
  lastChange: '1700000000',
  dealRating: '9',
  thumb: 'https://placehold.co/120x60/1a1a2e/ffffff?text=Jogo',
};

/** Intercepta todas as APIs externas usadas pelas telas públicas. */
export async function mockearApis(page: Page): Promise<void> {
  // RAWG: a rota registrada por último tem precedência, então o catch-all vem
  // antes e as coleções específicas depois. `/games/:id` devolve o jogo solto.
  await page.route('https://api.rawg.io/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: jogosFake.length, results: jogosFake, next: null, previous: null }),
    }),
  );
  await page.route('https://api.rawg.io/api/games/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(detailFake) }),
  );
  await page.route('https://api.rawg.io/api/genres**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 1, results: [{ id: 1, name: 'Action', slug: 'action' }] }),
    }),
  );
  await page.route('https://api.rawg.io/api/platforms**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 1, results: [{ id: 1, name: 'PC', slug: 'pc' }] }),
    }),
  );

  await page.route('https://www.cheapshark.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([dealFake]) }),
  );

  await page.route('https://newsapi.org/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'ok',
        totalResults: 1,
        articles: [
          {
            source: { id: 'teste', name: 'Fonte Teste' },
            title: 'Notícia de teste do GameHub',
            description: 'Resumo da notícia usada nos fluxos E2E.',
            url: 'https://exemplo.com/noticia',
            urlToImage: 'https://placehold.co/640x360/1a1a2e/ffffff?text=Noticia',
            publishedAt: '2024-01-01T00:00:00Z',
          },
        ],
      }),
    }),
  );

  await page.route('https://www.reddit.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          children: [
            {
              data: {
                id: 'post1',
                title: 'Post de teste sobre games',
                selftext: 'Discussão usada pelos fluxos E2E do GameHub.',
                permalink: '/r/gaming/comments/post1/',
                thumbnail: 'https://placehold.co/140x140/1a1a2e/ffffff?text=Post',
                created_utc: 1700000000,
              },
            },
            {
              data: {
                id: 'post2',
                title: 'Segundo post de teste',
                selftext: '',
                permalink: '/r/gaming/comments/post2/',
                thumbnail: 'self',
                created_utc: 1700003600,
              },
            },
          ],
        },
      }),
    }),
  );

  await page.route('https://store-site-backend-static.ak.epicgames.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          Catalog: {
            searchStore: { elements: [], paging: { total: 0 } },
          },
        },
      }),
    }),
  );

  await page.route('https://api.themoviedb.org/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [] }) }),
  );

  // Imagens de placeholder externo não devem travar o teste.
  await page.route('https://placehold.co/**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }),
  );
}
