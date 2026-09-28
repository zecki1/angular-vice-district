-- Campanha Vice District · tabela de leads da newsletter
-- Projeto compartilhado `angular-portfolio`.
-- Idempotente: pode rodar em qualquer ordem sem duplicar.

create table if not exists public.leads (
  id         bigint generated always as identity primary key,
  email      text        not null,
  slug       text        not null default 'gta-campaign',
  origem     text        not null default 'newsletter',
  criado_em  timestamptz not null default now()
);

-- Um e-mail por campanha: a mesma pessoa não entra duas vezes no mesmo slug.
create unique index if not exists leads_email_slug_uniq
  on public.leads (email, slug);

create index if not exists leads_slug_idx
  on public.leads (slug);

-- RLS ligado, com policy de insert público (anon key) e leitura bloqueada.
alter table public.leads enable row level security;

drop policy if exists "leads: anon inscreve" on public.leads;
create policy "leads: anon inscreve"
  on public.leads
  for insert
  to anon
  with check (true);

-- Sem policy de select: anon/authenticated não leem leads (é uma lista de contato).
drop policy if exists "leads: leitura somente service_role" on public.leads;
create policy "leads: leitura somente service_role"
  on public.leads
  for select
  to service_role
  using (true);
