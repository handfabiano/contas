-- ============================================
-- Sistema Financeiro - Contas a Pagar
-- Migração inicial para Supabase (Postgres)
--
-- Convertido do schema MySQL (setup-mysql.sql + migration-fundos.sql).
-- Tabela legada `contas` (database.sql) foi propositalmente omitida:
-- o sistema já migrou para `contas_pagar` (ver commit 2574dee).
-- ============================================

create extension if not exists pgcrypto;

-- ============================================
-- Util: atualizar updated_at automaticamente
-- (Postgres não tem "ON UPDATE CURRENT_TIMESTAMP" como o MySQL)
-- ============================================
create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- ============================================
-- TABELA: fundos (entradas / caixas)
-- ============================================
create table fundos (
    id bigint generated always as identity primary key,
    descricao text not null,
    fonte text not null,
    valor_entrada numeric(10,2) not null check (valor_entrada >= 0),
    data_entrada date not null,
    categoria text,
    observacoes text,
    status text not null default 'aberto' check (status in ('aberto', 'encerrado')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_fundos_data_entrada on fundos (data_entrada);
create index idx_fundos_status on fundos (status);

create trigger trg_fundos_updated_at
    before update on fundos
    for each row execute function set_updated_at();

-- ============================================
-- TABELA: contas_pagar (saídas)
-- ============================================
create table contas_pagar (
    id bigint generated always as identity primary key,
    fundo_id bigint references fundos(id) on delete restrict,
    descricao text not null,
    valor numeric(10,2) not null check (valor >= 0),
    credor text not null,
    tipo_despesa text not null check (tipo_despesa in (
        'moradia', 'alimentacao', 'transporte', 'saude',
        'educacao', 'lazer', 'contas', 'outros'
    )),
    data_vencimento date not null,
    observacoes text,
    status text not null default 'pendente' check (status in ('pendente', 'pago', 'atrasado')),
    tipo_lancamento text not null default 'individual' check (tipo_lancamento in ('individual', 'recorrente')),
    recorrencia_id uuid,
    parcela_atual int,
    total_parcelas int,
    periodicidade text check (periodicidade in ('semanal', 'quinzenal', 'mensal', 'anual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_contas_status on contas_pagar (status);
create index idx_contas_data_vencimento on contas_pagar (data_vencimento);
create index idx_contas_tipo_despesa on contas_pagar (tipo_despesa);
create index idx_contas_recorrencia on contas_pagar (recorrencia_id);
create index idx_contas_created_at on contas_pagar (created_at);
create index idx_contas_fundo on contas_pagar (fundo_id);

create trigger trg_contas_pagar_updated_at
    before update on contas_pagar
    for each row execute function set_updated_at();

-- ============================================
-- VIEW: contas com status calculado (atrasadas)
-- Equivalente à vw_contas_com_status do MySQL.
-- ============================================
create or replace view vw_contas_com_status as
select
    *,
    case
        when status = 'pago' then 'pago'
        when status = 'pendente' and data_vencimento < current_date then 'atrasado'
        else status
    end as status_calculado
from contas_pagar;

-- ============================================
-- FUNÇÃO: marcar contas vencidas como atrasadas
-- Substitui a PROCEDURE sp_atualizar_status_atrasado do MySQL.
-- Chame via supabase.rpc('atualizar_status_atrasado') ou agende com
-- pg_cron / Supabase Scheduled Functions para rodar diariamente.
-- ============================================
create or replace function atualizar_status_atrasado()
returns void as $$
begin
    update contas_pagar
    set status = 'atrasado'
    where status = 'pendente'
      and data_vencimento < current_date;
end;
$$ language plpgsql security definer;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
-- A tentativa anterior (js/supabase-config.js) criava a política
-- `USING (true) WITH CHECK (true)`, liberando leitura/escrita a qualquer
-- pessoa que tivesse a chave anon (que é pública, embutida no JS).
--
-- Aqui a política exige usuário autenticado (role "authenticated"),
-- mantendo o modelo atual de app single-user/família, mas fechando o
-- acesso anônimo. Se no futuro cada usuário precisar ver só os próprios
-- dados, adicionar uma coluna `user_id uuid references auth.users(id)`
-- e trocar `using (true)` por `using (auth.uid() = user_id)`.

alter table fundos enable row level security;
alter table contas_pagar enable row level security;

create policy "fundos: acesso autenticado" on fundos
    for all
    to authenticated
    using (true)
    with check (true);

create policy "contas_pagar: acesso autenticado" on contas_pagar
    for all
    to authenticated
    using (true)
    with check (true);
