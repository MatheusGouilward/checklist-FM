-- Vobi Checklist — Service Orders & Categories
-- Adds support for service orders (OS) and service categories

-- Service Categories (expandable for future FM types)
create table service_categories (
  id text primary key,                -- e.g. 'hvac', 'electrical', 'plumbing'
  name text not null,                 -- e.g. 'HVAC / Ar-Condicionado'
  template_id text not null,          -- ID of the checklist template to use
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Service Orders (OS — created by managers, assigned to technicians)
create table service_orders (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id),
  technician_id uuid not null references profiles(id),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  scheduled_date date not null,
  -- Location
  store_name text not null,
  store_contact text,
  shopping_name text not null,
  -- Equipment
  equipment_model text not null,
  equipment_capacity text not null,
  equipment_location text,
  -- Service
  service_category text not null references service_categories(id),
  service_type text not null check (service_type in ('preventive', 'corrective', 'installation')),
  notes text,
  -- Link to checklist (filled when technician starts)
  checklist_id uuid references checklists(id),
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add service_order_id FK to checklists
alter table checklists
  add column service_order_id uuid references service_orders(id);

-- Indexes
create index idx_service_orders_technician on service_orders(technician_id);
create index idx_service_orders_company on service_orders(company_id);
create index idx_service_orders_status on service_orders(status);
create index idx_service_orders_scheduled on service_orders(scheduled_date);
create index idx_checklists_service_order on checklists(service_order_id);

-- RLS
alter table service_categories enable row level security;
alter table service_orders enable row level security;

-- Service categories: all authenticated users can read
create policy "Authenticated users can read service categories"
  on service_categories for select
  using (auth.uid() is not null);

-- Service orders: technicians can read their own
create policy "Technicians can read own service orders"
  on service_orders for select
  using (technician_id = auth.uid());

-- Service orders: technicians can update their own (status, checklist_id)
create policy "Technicians can update own service orders"
  on service_orders for update
  using (technician_id = auth.uid());

-- Service orders: managers can CRUD all company service orders
create policy "Managers can read company service orders"
  on service_orders for select
  using (
    company_id = (select company_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'manager'
  );

create policy "Managers can insert company service orders"
  on service_orders for insert
  with check (
    company_id = (select company_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'manager'
  );

create policy "Managers can update company service orders"
  on service_orders for update
  using (
    company_id = (select company_id from profiles where id = auth.uid())
    and (select role from profiles where id = auth.uid()) = 'manager'
  );

-- Auto-update updated_at on service_orders
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger service_orders_updated_at
  before update on service_orders
  for each row execute function update_updated_at();
