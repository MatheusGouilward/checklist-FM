-- =============================================================================
-- Vobi Checklist — Setup Completo (Migrations + Seed)
-- =============================================================================
-- Cole este SQL inteiro no Supabase Dashboard > SQL Editor > New Query > Run
-- Isso cria todas as tabelas, RLS policies, e dados de demo.
-- =============================================================================

-- ========================
-- MIGRATION 001: Schema base
-- ========================

create extension if not exists "uuid-ossp";

-- Companies
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id),
  full_name text not null,
  role text not null check (role in ('technician', 'manager')),
  created_at timestamptz not null default now()
);

-- Checklists
create table if not exists checklists (
  id uuid primary key,
  company_id uuid not null references companies(id),
  technician_id uuid not null references profiles(id),
  technician_name text not null,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'completed')),
  service_result text check (service_result in ('ok', 'pending_issue', 'return_needed')),
  store_name text not null,
  shopping_name text not null,
  equipment_model text not null,
  equipment_capacity text not null,
  service_type text not null check (service_type in ('preventive', 'corrective', 'installation')),
  sections jsonb not null default '[]'::jsonb,
  observations text not null default '',
  return_justification text,
  signature text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  synced_at timestamptz default now()
);

-- Photos
create table if not exists photos (
  id uuid primary key,
  checklist_id uuid not null references checklists(id) on delete cascade,
  item_id text not null,
  storage_path text not null,
  timestamp timestamptz not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

-- Indexes (001)
create index if not exists idx_checklists_company on checklists(company_id);
create index if not exists idx_checklists_technician on checklists(technician_id);
create index if not exists idx_checklists_status on checklists(status);
create index if not exists idx_checklists_created on checklists(created_at desc);
create index if not exists idx_photos_checklist on photos(checklist_id);

-- ========================
-- MIGRATION 002: Service Orders
-- ========================

-- Service Categories
create table if not exists service_categories (
  id text primary key,
  name text not null,
  template_id text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Service Orders
create table if not exists service_orders (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id),
  technician_id uuid not null references profiles(id),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  scheduled_date date not null,
  store_name text not null,
  store_contact text,
  shopping_name text not null,
  equipment_model text not null,
  equipment_capacity text not null,
  equipment_location text,
  service_category text not null references service_categories(id),
  service_type text not null check (service_type in ('preventive', 'corrective', 'installation')),
  notes text,
  checklist_id uuid references checklists(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add service_order_id to checklists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'checklists' and column_name = 'service_order_id'
  ) then
    alter table checklists add column service_order_id uuid references service_orders(id);
  end if;
end $$;

-- Indexes (002)
create index if not exists idx_service_orders_technician on service_orders(technician_id);
create index if not exists idx_service_orders_company on service_orders(company_id);
create index if not exists idx_service_orders_status on service_orders(status);
create index if not exists idx_service_orders_scheduled on service_orders(scheduled_date);
create index if not exists idx_checklists_service_order on checklists(service_order_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists service_orders_updated_at on service_orders;
create trigger service_orders_updated_at
  before update on service_orders
  for each row execute function update_updated_at();

-- ========================
-- RLS POLICIES
-- ========================

alter table companies enable row level security;
alter table profiles enable row level security;
alter table checklists enable row level security;
alter table photos enable row level security;
alter table service_categories enable row level security;
alter table service_orders enable row level security;

-- Companies
drop policy if exists "Users can read own company" on companies;
create policy "Users can read own company"
  on companies for select
  using (id = (select company_id from profiles where id = auth.uid()));

-- Profiles
drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile"
  on profiles for select
  using (id = auth.uid());

drop policy if exists "Managers can read company profiles" on profiles;
create policy "Managers can read company profiles"
  on profiles for select
  using (
    company_id = (select company_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'manager'
  );

-- Checklists
drop policy if exists "Technicians can insert own checklists" on checklists;
create policy "Technicians can insert own checklists"
  on checklists for insert
  with check (technician_id = auth.uid());

drop policy if exists "Technicians can read own checklists" on checklists;
create policy "Technicians can read own checklists"
  on checklists for select
  using (technician_id = auth.uid());

drop policy if exists "Technicians can update own checklists" on checklists;
create policy "Technicians can update own checklists"
  on checklists for update
  using (technician_id = auth.uid());

drop policy if exists "Managers can read company checklists" on checklists;
create policy "Managers can read company checklists"
  on checklists for select
  using (
    company_id = (select company_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'manager'
  );

-- Photos
drop policy if exists "Users can insert photos for own checklists" on photos;
create policy "Users can insert photos for own checklists"
  on photos for insert
  with check (checklist_id in (select id from checklists where technician_id = auth.uid()));

drop policy if exists "Users can read photos for accessible checklists" on photos;
create policy "Users can read photos for accessible checklists"
  on photos for select
  using (checklist_id in (select id from checklists));

drop policy if exists "Users can delete own photos" on photos;
create policy "Users can delete own photos"
  on photos for delete
  using (checklist_id in (select id from checklists where technician_id = auth.uid()));

-- Service Categories
drop policy if exists "Authenticated users can read service categories" on service_categories;
create policy "Authenticated users can read service categories"
  on service_categories for select
  using (auth.uid() is not null);

-- Service Orders
drop policy if exists "Technicians can read own service orders" on service_orders;
create policy "Technicians can read own service orders"
  on service_orders for select
  using (technician_id = auth.uid());

drop policy if exists "Technicians can update own service orders" on service_orders;
create policy "Technicians can update own service orders"
  on service_orders for update
  using (technician_id = auth.uid());

drop policy if exists "Managers can read company service orders" on service_orders;
create policy "Managers can read company service orders"
  on service_orders for select
  using (
    company_id = (select company_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'manager'
  );

drop policy if exists "Managers can insert company service orders" on service_orders;
create policy "Managers can insert company service orders"
  on service_orders for insert
  with check (
    company_id = (select company_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'manager'
  );

drop policy if exists "Managers can update company service orders" on service_orders;
create policy "Managers can update company service orders"
  on service_orders for update
  using (
    company_id = (select company_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'manager'
  );

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('checklist-photos', 'checklist-photos', false)
on conflict (id) do nothing;
