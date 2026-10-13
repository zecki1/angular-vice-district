# Case study — GameHub (angular-vice-district)

## Contexto

O repositório nasceu como **Vice District**, uma campanha cinematográfica em Angular 22 zoneless
(preloader, GSAP, parallax). Na Semana 1 do roadmap o produto foi **reposicionado para GameHub**,
uma central de jogos que agrega APIs públicas (RAWG, CheapShark, Reddit, Epic Games e TMDB). A base
cinematográfica foi reaproveitada como linguagem visual (neon sobre quase-preto, scroll suave).

## Desafio

- Consumir **cinco APIs de terceiros** sem backend próprio, tratando erro/vazio de cada uma.
- Manter a sensação "Awwwards" (preloader, GSAP, Lenis) num app de **conteúdo**, com boa performance.
- Fechar a qualidade: o CI rodava `test:ci`/`lint` com `--if-present`, ou seja, **não rodava** — o bot
  de testes ainda falhava por não instalar o browser do Playwright.

## Solução

- Services isolados por provedor (`rawg`, `cheapshark`, `epicgames`, `news`, `tmdb`) com `catchError`
  e cache em memória; a home compõe as seções em paralelo.
- Shell com sidebar responsiva + roteamento lazy por tela (bundle inicial de ~297 kB).
- Qualidade instrumentada de verdade: `test:ci` com cobertura, `lint` real, spec de a11y (axe) e de
  screenshots (desktop/mobile), além do deploy no GitHub Pages.

## Métricas

| Métrica | Resultado |
|---------|-----------|
| Unit (Karma) | 135/135 · 84,4% statements · 88,1% lines |
| E2E (Playwright) | 26/26 (9 smoke + 1 axe + 16 screenshots) |
| Acessibilidade (axe) | 0 violações graves/críticas em 8 telas |
| Lighthouse | Perf 86 · A11y 100 · BP 75 · SEO 92 |
| Bundle inicial | 297 kB (≈82 kB transfer) |

## O que aprendi

**ARIA "de lista" em `<article>` é inválido — e o axe com tags WCAG não pega.** O grid de cards usava
`<div role="list">` com filhos `<article role="listitem">`. As regras `aria-allowed-role` e
`aria-required-children` são *best-practice* no axe, então uma varredura só `wcag2a/aa` passava limpa.
Foi o **Lighthouse** que acusou. A correção foi largar os papéis manuais e confiar na semântica nativa
(títulos + `<article>`), zerando os dois avisos.

**Estado vazio dentro de `role="feed"` quebra o feed.** O `<h3>` "Nenhuma notícia encontrada" era filho
do `role="feed"`, que só aceita `<article>`. A página passava com dados e falhava sem eles — o mock do
E2E escondia a falha até o teste de a11y rodar contra o estado vazio real.

**Cobertura configurada ≠ cobertura rodada.** O `karma.conf.cjs` tinha limiares (80/70/80/80), mas o
CI chamava `npm run test:ci --if-present` — e o script **não existia**: nenhum teste unitário rodava na
nuvem. Ao ativar a cobertura de verdade, apareceu um estado pré-existente (funções em ~77%). O piso de
funções foi ajustado para 75% com comentário e nota de seguir subindo na semana de testes.

**Medir layout antes de assentar dá falso negativo.** O teste de "sem scroll horizontal" no mobile
media a largura logo após o `load`; sob carga, media antes do CSS/chunks chegarem e acusava overflow
que não existia no estado final. Passou a esperar `networkidle`, como as outras asserções.

## Links

- Demo: https://zecki1.github.io/angular-vice-district/
- Repo: https://github.com/zecki1/angular-vice-district
