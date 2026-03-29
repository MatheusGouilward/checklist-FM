-- Vobi Checklist — Seed Data for Demo
-- Run AFTER migrations. Auth users must be created via Supabase Auth API or dashboard.
--
-- Demo credentials:
--   Técnico: carlos@techfrio.com / demo123
--   Gestor:  roberto@techfrio.com / demo123
--
-- IMPORTANT: Replace the UUIDs below with the actual auth.users IDs
-- after creating the users in Supabase Auth.

-- Step 1: Create auth users (run in Supabase dashboard > Authentication > Users)
-- Or via SQL (requires service_role key / superuser):
--
-- insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
-- values
--   ('11111111-1111-1111-1111-111111111111', 'carlos@techfrio.com', crypt('demo123', gen_salt('bf')), now(), '{}'),
--   ('22222222-2222-2222-2222-222222222222', 'roberto@techfrio.com', crypt('demo123', gen_salt('bf')), now(), '{}');

-- Step 2: Company
insert into companies (id, name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TechFrio Manutenção LTDA');

-- Step 3: Profiles (match the auth.users IDs)
insert into profiles (id, company_id, full_name, role) values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Carlos Silva', 'technician'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Roberto Mendes', 'manager');

-- Step 4: Service Category
insert into service_categories (id, name, template_id, active) values
  ('hvac', 'HVAC / Ar-Condicionado', 'hvac-pmoc-v1', true);

-- Step 5: Service Orders (3 OS for Carlos)
insert into service_orders (
  id, company_id, technician_id, status, scheduled_date,
  store_name, store_contact, shopping_name,
  equipment_model, equipment_capacity, equipment_location,
  service_category, service_type, notes
) values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'pending',
    current_date,
    'Loja Renner',
    'gerente@renner.com.br',
    'Shopping Center Norte',
    'Split Inverter Samsung AR24',
    '36000 BTU',
    'Teto da loja, acesso pela escada do corredor de serviço',
    'hvac',
    'preventive',
    'Revisão semestral PMOC. Filtros foram trocados na última visita (setembro).'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'pending',
    current_date + interval '1 day',
    'Starbucks',
    null,
    'Shopping Iguatemi',
    'Multi-Split LG Multi V 5',
    '48000 BTU',
    'Casa de máquinas no 3º subsolo, box 12',
    'hvac',
    'corrective',
    'Lojista relatou que ar não está gelando. Última manutenção há 4 meses.'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'pending',
    current_date + interval '3 days',
    'Lojas Americanas',
    'manutencao@americanas.com',
    'Shopping Morumbi',
    'Cassete Daikin FXFQ60P',
    '60000 BTU',
    'Forro da área de vendas, 4 unidades evaporadoras',
    'hvac',
    'preventive',
    'Primeira revisão após instalação. Verificar todos os pontos do PMOC.'
  );
