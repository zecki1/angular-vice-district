import { test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ID_JOGO_MOCK, mockearApis } from './apoio/api-mocks';

/**
 * Screenshots (baselines do README) — desktop/mobile das telas públicas.
 *
 * Rodar com `npm run e2e:screenshots` regera `docs/screenshots/*.jpg`.
 */
const PAGINAS = [
  { path: '/', nome: 'home' },
  { path: '/noticias', nome: 'noticias' },
  { path: '/lancamentos', nome: 'lancamentos' },
  { path: '/jogos', nome: 'jogos' },
  { path: '/ofertas', nome: 'ofertas' },
  { path: '/gratis', nome: 'gratis' },
  { path: `/jogo/${ID_JOGO_MOCK}`, nome: 'jogo-detalhe' },
  { path: '/mini-games', nome: 'mini-games' },
];

const VIEWPORTS = [
  { nome: 'desktop', width: 1440, height: 900 },
  { nome: 'mobile', width: 390, height: 844 },
];

const SAIDA = join('docs', 'screenshots');

/** Espera o preloader/animações de entrada assentarem antes do print. */
async function aguardarEstabilizar(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page
    .locator('[data-preloader]')
    .waitFor({ state: 'detached', timeout: 8000 })
    .catch(() => undefined);
  await page.waitForTimeout(1200);
}

test.describe('screenshots (baselines do README)', () => {
  test.beforeEach(async ({ page }) => {
    await mockearApis(page);
  });

  for (const viewport of VIEWPORTS) {
    test.describe(viewport.nome, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const pagina of PAGINAS) {
        test(`${pagina.nome} ${viewport.nome}`, async ({ page }) => {
          mkdirSync(SAIDA, { recursive: true });
          await page.goto(pagina.path);
          await aguardarEstabilizar(page);

          await page.screenshot({
            path: join(SAIDA, `${pagina.nome}-${viewport.nome}.jpg`),
            fullPage: true,
            type: 'jpeg',
            quality: 80,
          });
        });
      }
    });
  }
});
