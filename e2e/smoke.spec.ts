import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Smoke E2E — Vice District (pt-BR)
 * Fluxo: app carrega → conteúdo visível → sem violações de acessibilidade críticas.
 * Os fluxos da semana (preloader, trailer modal, newsletter) entram nas features.
 */
test('aplicação carrega e exibe conteúdo', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Vice District/i);
  await expect(page.locator('body')).not.toBeEmpty();
  await expect(page.locator('h1')).toContainText('VICE DISTRICT');
});

test('sem violações críticas de acessibilidade', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const resultados = await new AxeBuilder({ page }).analyze();
  const criticas = resultados.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  expect(criticas, JSON.stringify(criticas, null, 2)).toEqual([]);
});