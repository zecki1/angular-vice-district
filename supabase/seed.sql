-- Vice District (Semana 1) — seed de leads da campanha.
--
-- Rodar depois de 0001_leads.sql e 0002_rls.sql, no SQL Editor do projeto
-- `angular-portfolio` ou via `supabase db seed`.
--
-- Dados fictícios, com @example.com de propósito: são e-mails que não existem, e
-- nenhum deles pode ser dono de uma conta real em auth.users. As policies de RLS
-- exigem `project_slug = 'gta-campaign'`, então estas linhas também servem de
-- verificação: se o seed rodar com a policy errada, o insert é recusado.

insert into public.leads (project_slug, nome, email)
select 'gta-campaign', p.nome, p.email
from (values
  ('Camila Prado',   'camila.prado@example.com'),
  ('Rafael Menezes', 'rafael.menezes@example.com'),
  ('Juliana Tavares', 'juliana.tavares@example.com'),
  ('Bruno Salles',   'bruno.salles@example.com')
) as p(nome, email)
where not exists (
  select 1 from public.leads l
  where l.project_slug = 'gta-campaign' and l.email = p.email
);
