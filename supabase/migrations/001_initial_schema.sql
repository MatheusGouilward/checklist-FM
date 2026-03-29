-- Vobi Checklist — Initial Schema
-- Run this in the Supabase SQL editor or via CLI

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Companies table (tenant)
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Profiles table (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id),
  full_name text not null,
  role text not null check (role in ('technician', 'manager')),
  created_at timestamptz not null default now()
);

-- Checklists table
create table checklists (
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

-- Photos table (metadata only — blobs stored in Supabase Storage)
create table photos (
  id uuid primary key,
  checklist_id uuid not null references checklists(id) on delete cascade,
  item_id text not null,
  storage_path text not null,
  timestamp timestamptz not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_checklists_company on checklists(company_id);
create index idx_checklists_technician on checklists(technician_id);
create index idx_checklists_status on checklists(status);
create index idx_checklists_created on checklists(created_at desc);
create index idx_photos_checklist on photos(checklist_id);

-- RLS Policies

alter table companies enable row level security;
alter table profiles enable row level security;
alter table checklists enable row level security;
alter table photos enable row level security;

-- Profiles: users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (id = auth.uid());

-- Profiles: managers can read all profiles in their company
create policy "Managers can read company profiles"
  on profiles for select
  using (
    company_id = (select company_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'manager'
  );

-- Companies: users can read their own company
create policy "Users can read own company"
  on companies for select
  using (
    id = (select company_id from profiles where id = auth.uid())
  );

-- Checklists: technicians can CRUD their own checklists
create policy "Technicians can insert own checklists"
  on checklists for insert
  with check (technician_id = auth.uid());

create policy "Technicians can read own checklists"
  on checklists for select
  using (technician_id = auth.uid());

create policy "Technicians can update own checklists"
  on checklists for update
  using (technician_id = auth.uid());

-- Checklists: managers can read all company checklists
create policy "Managers can read company checklists"
  on checklists for select
  using (
    company_id = (select company_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'manager'
  );

-- Photos: follow checklist access
create policy "Users can insert photos for own checklists"
  on photos for insert
  with check (
    checklist_id in (select id from checklists where technician_id = auth.uid())
  );

create policy "Users can read photos for accessible checklists"
  on photos for select
  using (
    checklist_id in (select id from checklists)
  );

create policy "Users can delete own photos"
  on photos for delete
  using (
    checklist_id in (select id from checklists where technician_id = auth.uid())
  );

-- Storage bucket for photos (run separately in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('checklist-photos', 'checklist-photos', false);
