import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ID_JOGO_MOCK, mockearApis } from './apoio/api-mocks';

/**
 * Acessibilidade (axe) — varredura WCAG 2.0/2.1 A + AA nas telas públicas.
 *
 * As chamadas de API são mockadas (ver `e2e/apoio/api-mocks.ts`) para a
 * varredura olhar o conteúdo real das telas, não o estado vazio/erro.
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

test.describe('acessibilidade (axe)', () => {
  test.beforeEach(async ({ page }) => {
    await mockearApis(page);
  });

  test('gera relatório e falha em violações graves/críticas', async ({ page }) => {
    const relatorio: Array<Record<string, unknown>> = [];

    for (const pagina of PAGINAS) {
      await page.goto(pagina.path);
      await page.waitForLoadState('networkidle');

      const resultados = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const graves = resultados.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );

      relatorio.push({
        pagina: pagina.nome,
        url: pagina.path,
        violacoes: resultados.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          descricao: v.help,
          nos: v.nodes.length,
        })),
        passes: resultados.passes.length,
        graves: graves.length,
      });

      expect(
        graves,
        `violações graves/críticas em ${pagina.path}: ${graves.map((v) => v.id).join(', ')}`,
      ).toEqual([]);
    }

    mkdirSync('docs/a11y', { recursive: true });
    writeFileSync(
      join('docs/a11y', 'relatorio-axe.json'),
      `${JSON.stringify(relatorio, null, 2)}\n`,
      'utf8',
    );
  });
});
