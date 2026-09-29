# Supabase — Vice District

Tabela usada por este app: **`leads`** — a lista de espera da campanha (slug `gta-campaign`).

As migrations são aplicadas no projeto Supabase **compartilhado** `angular-portfolio`, que
atende todas as apps do roadmap (§4 do planejamento). Não existe uma tabela por projeto: o
que separa as bases de dados é a coluna `project_slug`, e as policies de insert de cada app
são ancoradas no slug dela.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `migrations/0001_leads.sql` | Tabela `leads` com `project_slug`, `nome` opcional, `email`, `created_at` e índice `(project_slug, created_at desc)` |
| `migrations/0002_rls.sql` | RLS: insert anônimo preso a `project_slug = 'gta-campaign'`; leitura e remoção só `admin`/`analyst` |
| `seed.sql` | 4 leads fictícios (`@example.com`) para validar a policy |

## Aplicar

```bash
# 1) no SQL Editor do projeto angular-portfolio, na ordem:
#    migrations/0001_leads.sql
#    migrations/0002_rls.sql
#    seed.sql
#
# 2) configure o front (nunca comite as chaves):
#    copie .env.example para .env e preencha VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
```

Com `VITE_SUPABASE_URL` preenchida, o `LeadService` faz `POST /rest/v1/leads`. Sem ela, a
newsletter grava no `localStorage` (modo demo) — o front nunca trava por falta de backend.

## Decisões de RLS

- **O insert anônimo é público, a leitura não.** A campanha precisa de barrier zero para
  quem não tem conta, mas e-mail capturado é dado pessoal: `user` e `viewer` não recebem
  nenhuma policy de `select`.
- **`with check (project_slug = 'gta-campaign')`**. Sem essa âncora, qualquer cliente
  poderia mandar um lead com o slug de outro app e poluir a base alheia — o risco real de
  um Supabase compartilhado por 12 projetos.
- **`current_role()` é `SECURITY DEFINER`**, porque a policy de `profiles` consulta
  `profiles`; sem isso haveria recursão de RLS.

## Por que `fetch` e não `@supabase/supabase-js`

O bundle inicial desta app é orçado em 500 kB e já carrega GSAP + ScrollTrigger + Lenis.
Puxar o client do Supabase para uma única inserção não se pagava. A Sem 3 (Ledger), que
precisa de Auth e de realtime, é o caso em que o client entra.
