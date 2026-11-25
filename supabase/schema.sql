-- ============================================================================
-- Estúdio Atlas — Schema Supabase para Portfólio, Agendamentos e Inventário
-- Execute este script no SQL Editor do seu projeto Supabase.
-- ============================================================================

create table if not exists public.portfolio_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

-- Atualiza automaticamente o campo updated_at a cada modificação
create or replace function public.set_portfolio_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_portfolio_state_updated_at on public.portfolio_state;
create trigger trg_portfolio_state_updated_at
  before update on public.portfolio_state
  for each row
  execute function public.set_portfolio_updated_at();

-- Habilita Row Level Security (RLS)
alter table public.portfolio_state enable row level security;

-- Política de leitura pública (necessária para o link público /p/:slug)
drop policy if exists "Leitura pública do portfólio" on public.portfolio_state;
create policy "Leitura pública do portfólio"
  on public.portfolio_state
  for select
  to anon, authenticated
  using (true);

-- Política de escrita para permitir agendamentos/reservas públicas e edições do admin
-- (Para maior segurança em produção, migre a escrita administrativa para Supabase Auth)
drop policy if exists "Inserção inicial e atualizações do estado" on public.portfolio_state;
create policy "Inserção inicial e atualizações do estado"
  on public.portfolio_state
  for insert
  to anon, authenticated
  with check (id = 'default');

drop policy if exists "Atualização do estado do portfólio" on public.portfolio_state;
create policy "Atualização do estado do portfólio"
  on public.portfolio_state
  for update
  to anon, authenticated
  using (id = 'default')
  with check (id = 'default');

-- Habilita Realtime para sincronizar mudanças entre Admin e Visitantes ao vivo
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'portfolio_state'
  ) then
    alter publication supabase_realtime add table public.portfolio_state;
  end if;
end $$;
