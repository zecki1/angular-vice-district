# Integração Microsoft Clarity (mapa de calor)

O Clarity grava **mapas de calor, scroll, cliques e sessões** para validar a UX do projeto. Roda em produção/homologação (nos estáticos do Vercel).

## 1. Projeto criado

- Projeto: `zecki-vice-district`
- Project ID: `ymef9p6m6l`
- URL pública: https://vice-district.vercel.app

## 2. Como o snippet é injetado

O app não usa o bloco fixo no `index.html`. Um serviço Angular (`src/app/core/clarity.service.ts`),
chamado no `App` (construtor), injeta o snippet oficial em runtime **apenas no browser** e **apenas se
`environment.clarityId` existir** (arquivo `src/environments/environment.prod.ts`). Snippet usado:

```html
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "ymef9p6m6l");
</script>
```

## 3. Verificação

- **Browser (produção)**: rede → requisição para `clarity.ms/tag/*` retornando 200 e `window.clarity` = função.
- **Painel Clarity**: dashboard do projeto `zecki-vice-district` com sessões e heatmaps gravando.
- DP: não precisa de consentimento explícito em RGPD, mas respeite o banner de cookies caso o hub exija.

## 4. Bot humano + Clarity

O **Bot — Navegação Humana** gera sessões reais (mouse/scroll/cliques), o que alimenta o mapa de calor
com dados úteis mesmo antes de tráfego real. Configure `BOT_URL` (Settings → Variables) e o Clarity captura as sessões do bot.