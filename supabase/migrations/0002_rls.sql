-- Vice District (Semana 1) — Row Level Security de `leads` (§4.3 do planejamento).
--
-- Regra do projeto: o formulário da campanha é público, mas a base de e-mails
-- capturados não é. Anônimo escreve; `user` e `viewer` não enxergam nada;
-- `admin` e `analyst` listam para retargeting.

alter table public.leads enable row level security;

-- Helper: role do usuário autenticado, lido do próprio profile.
-- SECURITY DEFINER evita recursão de RLS (a policy de `profiles` consulta `profiles`).
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- O insert anônimo é travado pelo slug: sem o `with check`, qualquer cliente
-- poderia forjar 'aurum-3d' e poluir a base de outro projeto do roadmap.
drop policy if exists "leads: envio anônimo" on public.leads;
create policy "leads: envio anônimo"
  on public.leads
  for insert
  with check (project_slug = 'gta-campaign');

-- E-mail capturado é dado pessoal: só admin/analyst consultam.
drop policy if exists "leads: leitura só admin/analyst" on public.leads;
create policy "leads: leitura só admin/analyst"
  on public.leads
  for select
  using (public.current_role() in ('admin', 'analyst'));

drop policy if exists "leads: remoção só admin/analyst" on public.leads;
create policy "leads: remoção só admin/analyst"
  on public.leads
  for delete
  using (public.current_role() in ('admin', 'analyst'));
