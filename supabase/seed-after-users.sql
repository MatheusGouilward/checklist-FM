-- =============================================================================
-- Vobi Checklist — Seed (rodar DEPOIS de criar os auth users)
-- =============================================================================
--
-- ANTES de rodar este script:
-- 1. Vá em Supabase Dashboard > Authentication > Users > Add User
-- 2. Crie 2 usuários:
--    - carlos@techfrio.com / demo123  (copie o UUID gerado)
--    - roberto@techfrio.com / demo123 (copie o UUID gerado)
-- 3. Substitua os UUIDs abaixo pelos reais
-- =============================================================================

-- ⚠️  SUBSTITUA ESTES UUIDs pelos reais do Supabase Auth:
\set carlos_id '11111111-1111-1111-1111-111111111111'
\set roberto_id '22222222-2222-2222-2222-222222222222'

-- Se estiver rodando no SQL Editor do dashboard, use esta versão:
-- (descomente o bloco abaixo e comente o \set acima)

/*
-- Company
insert into companies (id, name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TechFrio Manutenção LTDA')
on conflict (id) do nothing;

-- Profiles (substitua os UUIDs!)
insert into profiles (id, company_id, full_name, role) values
  ('COLE-UUID-DO-CARLOS-AQUI', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Carlos Silva', 'technician'),
  ('COLE-UUID-DO-ROBERTO-AQUI', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Roberto Mendes', 'manager')
on conflict (id) do nothing;

-- Service Category
insert into service_categories (id, name, template_id, active) values
  ('hvac', 'HVAC / Ar-Condicionado', 'hvac-pmoc-v1', true)
on conflict (id) do nothing;

-- Service Orders (substitua o UUID do Carlos no technician_id!)
insert into service_orders (
  company_id, technician_id, status, scheduled_date,
  store_name, store_contact, shopping_name,
  equipment_model, equipment_capacity, equipment_location,
  service_category, service_type, notes
) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'COLE-UUID-DO-CARLOS-AQUI',
    'pending', current_date,
    'Loja Renner', 'gerente@renner.com.br', 'Shopping Center Norte',
    'Split Inverter Samsung AR24', '36000 BTU',
    'Teto da loja, acesso pela escada do corredor de serviço',
    'hvac', 'preventive',
    'Revisão semestral PMOC. Filtros foram trocados na última visita (setembro).'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'COLE-UUID-DO-CARLOS-AQUI',
    'pending', current_date + interval '1 day',
    'Starbucks', null, 'Shopping Iguatemi',
    'Multi-Split LG Multi V 5', '48000 BTU',
    'Casa de máquinas no 3º subsolo, box 12',
    'hvac', 'corrective',
    'Lojista relatou que ar não está gelando. Última manutenção há 4 meses.'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'COLE-UUID-DO-CARLOS-AQUI',
    'pending', current_date + interval '3 days',
    'Lojas Americanas', 'manutencao@americanas.com', 'Shopping Morumbi',
    'Cassete Daikin FXFQ60P', '60000 BTU',
    'Forro da área de vendas, 4 unidades evaporadoras',
    'hvac', 'preventive',
    'Primeira revisão após instalação. Verificar todos os pontos do PMOC.'
  );
*/
