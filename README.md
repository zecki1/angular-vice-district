# Vice District — angular-vice-district

> Semana(s): 1 · Pilar: **Showcase** · Teste unitário: **Karma** · Milestone(s): `m1-vice-district`
> Repo público: [github.com/zecki1/angular-vice-district](https://github.com/zecki1/angular-vice-district)

## Objetivo de entrevista

dominar narrativa visual cinemática: scroll-driven, preloader, parallax e micro-interações em Angular zoneless

## Stack

- **Angular 22** — standalone, signals, **zoneless** (`provideZonelessChangeDetection`), OnPush
- **GSAP + ScrollTrigger** — timelines de entrada e parallax com `scrub`
- **Lenis** — scroll suave, ligado ao `ScrollTrigger.update` no mesmo rAF
- **Supabase** — tabela `leads` para a newsletter (projeto compartilhado `angular-portfolio`)
- **Tailwind CSS v4** · **Vercel** — build estático (sem cold start, sempre online)

> O bloco de stack do template citava ECharts e three.js. Nenhum dos dois se aplica a
> um site de campanha: entraram **GSAP** e **Lenis**, que são o que a spec da semana pede.

## Fluxo de trabalho (Git)

Ambientes preservados em **português brasileiro** (commits, PRs, issues, CI).

```
main      → produção (build estático; nunca push direto)
homolog   → validação/release de PRs (staging)
develop   → integração diária (merges das branches feat/*)
feature   → feat/<assunto> + PR para develop (boas práticas de código limpo)
```

- **Commits:** `feat:`, `fix:`, `test:`, `docs:`, `design:`, `ops:`, `backend:` (conventional commits)
- **PRs:** sempre via **pull request template**; revisados e mergeados por milestone
- **main:** protegida — merge somente via PR de `homolog`
- Rastreabilidade com issues, labels (`feat/test/design/ops/backend`), milestones e releases

## Seções da Semana 1

| Seção            | O que demonstra                                                        |
| ---------------- | ---------------------------------------------------------------------- |
| Preloader        | progresso reativo, barra em CSS puro, some sozinho                     |
| Hero             | timeline GSAP de entrada + parallax com `scrub` no fundo e no título   |
| Prólogo          | parallax por elemento (`apParallax`) em imagens com `scale-125`        |
| Personagens      | stagger por atributo (`apReveal="120"`) e hover com cor por personagem |
| Locais           | grade responsiva com legenda sobre imagem                              |
| Trailer          | modal acessível: `aria-modal`, focus trap, `Escape`, devolução de foco |
| Newsletter       | form com validação, `Supabase.leads` e fallback de modo demo           |
| Rodapé           | navegação por âncoras + aviso de conteúdo ficcional                    |

## Arquitetura

```
src/app/
├─ core/
│  ├─ animation.ts              # registro do GSAP + guarda canAnimate()
│  ├─ content.ts                # narrativa (personagens, locais, prólogo)
│  └─ services/                 # PreloaderService · SmoothScrollService · LeadService · ClarityService
├─ features/                    # uma pasta por seção, todas lazy por padrão
│  ├─ preloader/ hero/ prologo/ characters/ locations/ trailer/ newsletter/ footer/
├─ shared/directives/           # apReveal (entrada) · apParallax (scrub)
└─ home.component.ts            # orquestra: scroll suave, preloader e o modal
```

`app.ts` é só o shell: `<app-preloader />` + `<router-outlet />`. A home é lazy,
então o app entrega o preloader antes de qualquer JavaScript de animação.

## Decisões técnicas

**Preloader sem GSAP.** A primeira versão animava a barra com `gsap.to` e isso arrastava
`gsap` + `ScrollTrigger` — **272 kB** — para o bundle inicial, só para mover um `width: %`.
A barra virou uma transição de CSS de 300 ms e o GSAP passou a entrar junto com o chunk
lazy da home, ou seja, atrás do próprio preloader. Initial saiu de **367 kB para 269 kB**
(112 kB → 76 kB transferidos).

**Progresso honesto.** A barra sobe até 90% com passo decrescente e só fecha em 100 no
`DOMContentLoaded`. Um `setTimeout` de 6 s é a rede de segurança: nenhum bug pode prender
o visitante atrás do overlay.

**Todo movimento passa por `canAnimate()`.** Uma função só decide se GSAP roda: exige
browser real, bloqueia jsdom e respeita `prefers-reduced-motion`. Com isso, o CSS de
`reduced-motion` e a lógica de animação não divergem.

**Newsletter degrada, não quebra.** Sem `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` o
formulário resolve como sucesso e registra no console — o site roda em preview e em CI sem
credencial. Com credencial, `@supabase/supabase-js` entra por `import()` dinâmico e só
vira chunk quando alguém realmente se inscreve.

**RLS no `leads`.** Insert liberado para `anon`, **sem policy de select** — a lista de
contato é ilegível pelo anon key, e-mail só sai por `service_role`. Índice único por
`(email, slug)` evita a mesma pessoa entrando duas vezes na mesma campanha.

## Ambiente (Supabase)

Variáveis em `.env` (nunca commitadas). `scripts/gerar-ambiente.mjs` transforma `VITE_*`
em `src/environments/ambiente.local.ts` no `prestart`/`prebuild`/`pretest` — o arquivo
gerado é gitignored, então **nenhuma chave real entra no git**.

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_TRAILER_VIDEO_ID=     # opcional: sem ele o modal mostra "em montagem"
```

Dados usados: `leads` (slug `gta-campaign`) · schema em [`supabase/migrations/`](./supabase/migrations)

## Rodando localmente

```bash
npm install
npm start            # ng serve
npm test             # unitário (Karma)
npm run test:watch   # unitário em watch
npm run e2e          # Playwright (sobe o ng serve sozinho)
npm run lint         # ng lint
npm run build        # ng build
npm run analyze      # source-map-explorer (análise de bundle)
```

## Decisão de teste: Karma

O ledger usa **Vitest** e este usa **Karma**, de propósito. Karma + Jasmine é o runner
clássico do Angular e já vinha com `karma.conf.cjs` e `src/test.ts` prontos; trocar de
runner aqui só trocaria problemas conhecidos por novos. O que o Karma tem de sobra neste
projeto é o que importa: **Chrome headless de verdade**, e por isso GSAP, ScrollTrigger e
`getComputedStyle` rodam de verdade nos testes — foi assim que o bug de foco do modal
apareceu (veja abaixo). Vitest em jsdom teria passado reto.

O trade-off: a asserção de focus trap ficou no Playwright, não aqui. Em Chrome headless sem
rede o `focus()` num `<iframe>` não pega, e `document.activeElement` fica em `<body>` —
testar o trap no unitário exigiria simular a semântica de foco do browser, que é pior do
que testar no browser.

> Cada repo alterna Karma/Vitest de propósito: agnóstico de ferramenta, escolha por contexto.

## Checklist DoD

- [x] Build/lint limpos
- [x] Unit (Karma) — **26 testes** verdes
- [x] E2E Playwright — **11 testes** verdes, incluindo axe (página e modal aberto)
- [ ] Lighthouse ≥ 90 (fica para a Semana 10, trilha de performance do roadmap)
- [x] Responsivo (grid colapsa, testado em 390px sem overflow horizontal)
- [x] README com decisão de teste e "o que aprendi"
- [x] Supabase configurado (migration `leads` + RLS, com fallback demo)
- [ ] PR revisado + merged + release por milestone

## O que aprendi

**Um preloader de 272 kB é um preloader de CSS.** O que entregou o número foi perguntar
"de quem é essa dependência?", não "como diminuo o bundle?". `PreloaderService` importava
GSAP para interpolar um número; a resposta certa era uma transição de CSS e o GSAP
esperando no chunk lazy. Vale notar o detalhe: o `angular.json` original aceitaria 500 kB
de warning e 1 MB de erro, então **nenhum build teria acusado o problema**. Orçamento
de bundle vale zero se ele é generoso — os números saíram da medição: 300 kB / 400 kB.

**Lazy loading quebrou o preloader, e nada no build avisou.** A home carrega sob demanda, ou
seja, quando o construtor dela roda o `DOMContentLoaded` **já aconteceu**. O listener nunca
disparava e o preloader ficava travado em 90% com a página inteira atrás dele — em
produção, para sempre. O build passava, os unitários passavam (o `PreloaderService` estava
correto), e quem pegou foi o primeiro E2E que esperou o overlay sumir. Lazy loading não
muda só *quando* o código roda; muda **qual contexto de timing ele encontra**.

**`autoAlpha` no modal de entrada roubou o foco de quem usa teclado.** A animação de
abertura usava `gsap.from(..., { autoAlpha: 0 })`, e `autoAlpha` escreve
`visibility: hidden` durante o tween. O `focus()` no botão de fechar acontecia sobre um
elemento invisível — ou seja, **não acontecia**: quem abre o modal e aperta Tab recomeçava
do topo da página. Trocar por `opacity` resolveu, porque opacidade não afeta
focalizabilidade. A mesma armadilha de "animar com `visibility`" aparece em todo menu e
dropdown, e nenhum aviso de lint cobre isso.

**Dois bugs de uma vez porque o campo não estava ligado ao modelo.** O input da newsletter
aceitava digitação, o `required` nativo passava, e o e-mail válido era rejeitado. O
`[(ngModel)]` simplesmente não estava lá — o signal ficava vazio enquanto a caixa mostrava
o texto. Nenhum teste unitário de serviço pegaria isso (o `LeadService` estava correto); só
o E2E, preenchendo a tela como um usuário, viu. Vale como regra: **modelo ligado é
precondição de teste, não detalhe de template.**

**O axe acusou contraste onde não havia problema, e o motivo foi útil.** O modal reprovou
em `color-contrast` com 2.82:1. A causa não era a paleta: era o axe medindo **no meio da
animação de entrada**, com `opacity` ainda em 0.72. Em vez de um `waitForTimeout`, o teste
espera a opacidade chegar a 1 — e isso ensina que falso positivo de a11y também tem causa
estrutural, e vale entender antes de "relaxar" a asserção.

**O que o axe pegou de verdade foi contraste de opacidade.** `text-fog/70` e `text-fog/50`
no rodapé davam 3.38:1 e 2.26:1. Sob um preto quase absoluto, qualquer `/50` mata o texto
— e a intenção de design ("deixa bem discreto") colide com a WCAG. A solução foi subir para
`text-fog` cheio e ajustar a hierarquia com tamanho e espaçamento, não com opacidade.

## Screenshots

_(capturar em produção: hero, prólogo, personagens, locais, modal do trailer, newsletter)_

## Microsoft Clarity (mapa de calor)

Integração documentada em [`docs/clarity-integracao.md`](./docs/clarity-integracao.md).
Snippet só é ativado quando a variável `CLARITY_PROJECT_ID` estiver definida.

## Permanência online

Estratégia zero-standby documentada em [`docs/manter-online.md`](./docs/manter-online.md).
