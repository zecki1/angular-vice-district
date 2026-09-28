-- Vice District (Semana 1) — tabela de leads da campanha.
--
-- Aplicar no projeto Supabase compartilhado `angular-portfolio` (§4 do planejamento).
-- Idempotente: pode ser reaplicada sem efeito colateral.
--
-- O schema-base (§4.2) já prevê `leads` com `project_slug` justamente para que as 12
-- apps do roadmap compartilhem uma única tabela. A Sem 1 usa o slug 'gta-campaign'.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  project_slug text not null,
  -- `nome` é opcional: o formulário desta semana captura só e-mail, mas a Sem 5
  -- (Aurum) coleta nome + e-mail. A coluna existe desde já para a Sem 5 não exigir
  -- migration de evolução — e vice-versa.
  nome text,
  email text not null,
  created_at timestamptz not null default now()
);

-- Coluna `nome` para bases criadas a partir do schema-base de §4.2 (sem ela).
alter table public.leads add column if not exists nome text;

-- O front sempre filtra por slug; o índice evita full scan e já ordena por data,
-- que é a ordem que a tela de consulta usa.
create index if not exists leads_project_slug_idx
  on public.leads (project_slug, created_at desc);
