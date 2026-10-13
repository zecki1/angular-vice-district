import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * E2E — GameHub (Semana 1, `angular-vice-district`)
 *
 * O repo nasceu como campanha cinematográfica Vice District e foi reposicionado
 * para central de jogos que agrega APIs gratuitas (RAWG, CheapShark, Reddit,
 * TMDB). Estes fluxos exercitam o app que está de fato em produção: navegação
 * do shell, catálogo, detalhe do jogo, filtro de ofertas e a11y.
 *
 * As chamadas de API são interceptadas para o teste não depender de cota de
 * terceiro nem de rede: o contrato (array de jogos) é o que importa aqui.
 */

const jogoFake = {
  id: 1,
  name: 'Jogo de Teste',
  background_image: 'https://placehold.co/460x215/1a1a2e/ffffff?text=Jogo',
  metacritic: 88,
  rating: 4.5,
  genres: [{ id: 1, name: 'Action', slug: 'action' }],
  platforms: [{ platform: { id: 1, name: 'PC', slug: 'pc' } }],
};

const jogosFake = [jogoFake, { ...jogoFake, id: 2, name: 'Segundo Jogo' }];

async function mockearAPIs(page: import('@playwright/test').Page) {
  // Todas as chamadas passam pelo proxy do BFF (`/api/*`); o sub-recurso vem no
  // parâmetro `path`, então a resposta é escolhida por ele.
  await page.route('**/api/rawg**', (route) => {
    const recurso = new URL(route.request().url()).searchParams.get('path') ?? '';
    if (recurso.startsWith('games/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...jogoFake,
          slug: 'jogo-de-teste',
          description: 'Um jogo de teste usado pelos fluxos E2E.',
          description_raw: 'Um jogo de teste usado pelos fluxos E2E.',
          website: '',
          developers: [],
          publishers: [],
          screenshots: [],
          movies: [],
          achievements: [],
          parent_game: null,
          background_color: '#101018',
          released: '2020-01-01',
        }),
      });
    }
    if (recurso === 'genres') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 1, results: [{ id: 1, name: 'Action', slug: 'action' }] }),
      });
    }
    if (recurso === 'platforms') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 1, results: [{ id: 1, name: 'PC', slug: 'pc' }] }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: jogosFake.length, results: jogosFake, next: null, previous: null }),
    });
  });
  await page.route('**/api/cheapshark**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
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
        },
      ]),
    }),
  );
  await page.route('**/api/tmdb**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [] }) }),
  );
  await page.route('**/api/reddit**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { children: [] } }),
    }),
  );
  // Imagens de placeholder externo não devem travar o teste.
  await page.route('https://placehold.co/**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }),
  );
}

test.beforeEach(async ({ page }) => {
  await mockearAPIs(page);
});

test('a home abre com o título da central de jogos', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/GameHub/i);
  await expect(page.getByRole('heading', { level: 1, name: /Sua Central de/i })).toBeVisible();
});

test('a navegação do shell leva a cada seção', async ({ page }) => {
  await page.goto('/');

  const rotas: Array<[string, string]> = [
    ['Notícias', '/noticias'],
    ['Lançamentos', '/lancamentos'],
    ['Jogos', '/jogos'],
    ['Ofertas', '/ofertas'],
    ['Grátis', '/gratis'],
    ['Mini-Games', '/mini-games'],
  ];

  for (const [rotulo, rota] of rotas) {
    await page.goto(rota);
    await expect(page).toHaveURL(new RegExp(rota.replace(/\//g, '\\/') + '$'));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
});

test('o catálogo lista os jogos vindos da API', async ({ page }) => {
  await page.goto('/jogos');

  await expect(page.getByRole('heading', { level: 1, name: /Catálogo de Jogos/i })).toBeVisible();
  await expect(page.getByText('Jogo de Teste').first()).toBeVisible();
});

test('o detalhe do jogo abre pelo id da rota', async ({ page }) => {
  await page.goto('/jogo/1');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Jogo de Teste/i }).first()).toBeVisible();
});

test('as ofertas trazem preço e filtro por loja', async ({ page }) => {
  await page.goto('/ofertas');

  await expect(page.getByRole('heading', { level: 1, name: 'Ofertas' })).toBeVisible();

  // O `label` precisa estar ligado ao `select` (regra de a11y do projeto).
  const filtroLoja = page.locator('#filtro-loja');
  await expect(filtroLoja).toBeVisible();
  await expect(page.locator('label[for="filtro-loja"]')).toHaveText('Loja');
  await expect(page.locator('#filtro-ordem')).toBeVisible();
});

test('os jogos grátis abrem a listagem', async ({ page }) => {
  await page.goto('/gratis');

  await expect(page.getByRole('heading', { level: 1, name: /Jogos Grátis/i })).toBeVisible();
});

test('sem violações graves ou críticas na home', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const resultados = await new AxeBuilder({ page }).analyze();
  const graves = resultados.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  expect(graves, JSON.stringify(graves, null, 2)).toEqual([]);
});

test('sem violações graves ou críticas no catálogo', async ({ page }) => {
  await page.goto('/jogos');
  await page.waitForLoadState('networkidle');

  const resultados = await new AxeBuilder({ page }).analyze();
  const graves = resultados.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  expect(graves, JSON.stringify(graves, null, 2)).toEqual([]);
});

test('responde bem em viewport de celular, sem scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Sem esperar o layout assentar, a medição acontece antes do CSS/chunks
  // chegarem (sob carga) e acusa overflow que não existe no estado final.
  await page.waitForLoadState('networkidle');

  const overflowHorizontal = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflowHorizontal).toBe(false);
});
