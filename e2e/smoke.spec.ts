import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * E2E — Vice District (pt-BR)
 * Fluxos da Semana 1: preloader → hero → seções → modal do trailer → newsletter.
 */

test.beforeEach(async ({ page }) => {
  // As imagens vêm de picsum; sem isso o scroll pode ocorrer antes do layout.
  await page.route('https://picsum.photos/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/webp',
      body: '',
    }),
  );
});

test('carrega a home com o título da campanha', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Vice District/i);
  await expect(page.locator('h1')).toContainText('VICE');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('DISTRICT');
});

test('o preloader aparece e some', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });

  const preloader = page.getByTestId('preloader');
  await expect(preloader).toBeVisible();
  // some sozinho, sem intervenção
  await expect(preloader).toBeHidden({ timeout: 15_000 });
});

test('renderiza as seções da campanha', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('prologo')).toBeVisible();
  await expect(page.getByTestId('characters')).toBeVisible();
  await expect(page.getByTestId('locations')).toBeVisible();
  await expect(page.getByTestId('newsletter')).toBeVisible();
  await expect(page.getByTestId('footer')).toContainText('VICE DISTRICT');
});

test('abre e fecha o modal do trailer', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('preloader').waitFor({ state: 'hidden' });

  await page.getByTestId('hero-trailer').click();

  const modal = page.getByTestId('trailer-modal');
  await expect(modal).toBeVisible();
  await expect(modal).toHaveAttribute('aria-modal', 'true');
  await expect(page.getByTestId('trailer-sem-video')).toBeVisible();

  await page.getByTestId('trailer-fechar').click();
  await expect(page.getByTestId('trailer-modal')).toHaveCount(0);
});

test('Escape fecha o modal e devolve o foco ao botão que abriu', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('preloader').waitFor({ state: 'hidden' });

  const abrir = page.getByTestId('hero-trailer');
  await abrir.click();
  await expect(page.getByTestId('trailer-modal')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByTestId('trailer-modal')).toHaveCount(0);
  await expect(abrir).toBeFocused();
});

test('o foco fica preso dentro do modal', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('preloader').waitFor({ state: 'hidden' });

  await page.getByTestId('hero-trailer').click();
  await expect(page.getByTestId('trailer-modal')).toBeVisible();

  // Vários Tabs não podem escapar do diálogo.
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('Tab');
    const dentroDoModal = await page.evaluate(() => {
      const dialogo = document.querySelector('[data-testid="trailer-modal"]');
      return !!dialogo && document.activeElement !== null && dialogo.contains(document.activeElement);
    });
    expect(dentroDoModal, `Tab ${i + 1} saiu do modal`).toBe(true);
  }
});

test('recusa e-mail inválido na newsletter', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('preloader').waitFor({ state: 'hidden' });

  await page.getByTestId('newsletter-enviar').click();
  await expect(page.getByTestId('newsletter-erro')).toBeVisible();
});

test('aceita e-mail válido no modo demo', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('preloader').waitFor({ state: 'hidden' });

  await page.getByLabel('Seu e-mail').fill('ana@vice.district');
  await page.getByTestId('newsletter-enviar').click();

  await expect(page.getByTestId('newsletter-ok')).toBeVisible();
});

test('sem violações críticas de acessibilidade', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('preloader').waitFor({ state: 'hidden' });
  await page.waitForLoadState('networkidle');

  const resultados = await new AxeBuilder({ page }).analyze();
  const graves = resultados.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  expect(graves, JSON.stringify(graves, null, 2)).toEqual([]);
});

test('sem violações críticas com o modal aberto', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('preloader').waitFor({ state: 'hidden' });

  await page.getByTestId('hero-trailer').click();
  await expect(page.getByTestId('trailer-modal')).toBeVisible();

  // A entrada do modal anima `opacity` de 0 a 1. Medir contraste no meio da
  // animação dá falso positivo, então espera o valor estabilizar em 1.
  await page.waitForFunction(
    () => {
      const painel = document.querySelector('[data-testid="trailer-modal"]');
      return !!painel && getComputedStyle(painel).opacity === '1';
    },
    undefined,
    { timeout: 5000 },
  );

  const resultados = await new AxeBuilder({ page }).analyze();
  const graves = resultados.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  expect(graves, JSON.stringify(graves, null, 2)).toEqual([]);
});

test('responde bem em viewport de celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByTestId('preloader').waitFor({ state: 'hidden' });

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const overflowHorizontal = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflowHorizontal).toBe(false);
});
