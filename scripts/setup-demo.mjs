#!/usr/bin/env node

/**
 * Vobi Checklist — Demo Setup Script
 *
 * Cria usuários demo e dados de seed no Supabase.
 * Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY como env vars.
 *
 * Uso:
 *   node scripts/setup-demo.mjs
 *
 * Ou com env vars inline:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/setup-demo.mjs
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing env vars. Set:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=eyJ...');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

async function supabaseAdmin(path, method = 'GET', body = null) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${method} ${path} failed: ${JSON.stringify(data)}`);
  }
  return data;
}

async function createAuthUser(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    // User may already exist
    if (data.msg?.includes('already') || data.message?.includes('already')) {
      console.log(`   ⚠️  ${email} already exists, fetching...`);
      const listRes = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`,
        { headers }
      );
      const listData = await listRes.json();
      const existing = listData.users?.find((u) => u.email === email);
      if (existing) return existing.id;
      throw new Error(`Could not find existing user ${email}`);
    }
    throw new Error(`Create user ${email} failed: ${JSON.stringify(data)}`);
  }
  return data.id;
}

async function rpc(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ query: sql }),
  });
  return res;
}

async function insertRow(table, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal,resolution=merge-duplicates' },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(`Insert into ${table} failed: ${JSON.stringify(data)}`);
  }
}

async function main() {
  console.log('🚀 Vobi Checklist — Setup Demo\n');

  // 1. Create auth users
  console.log('1️⃣  Creating auth users...');
  const carlosId = await createAuthUser('carlos@techfrio.com', 'demo123');
  console.log(`   ✅ Carlos Silva (technician): ${carlosId}`);
  const robertoId = await createAuthUser('roberto@techfrio.com', 'demo123');
  console.log(`   ✅ Roberto Mendes (manager): ${robertoId}`);

  // 2. Company
  console.log('\n2️⃣  Creating company...');
  const companyId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  await insertRow('companies', { id: companyId, name: 'TechFrio Manutenção LTDA' });
  console.log('   ✅ TechFrio Manutenção LTDA');

  // 3. Profiles
  console.log('\n3️⃣  Creating profiles...');
  await insertRow('profiles', {
    id: carlosId,
    company_id: companyId,
    full_name: 'Carlos Silva',
    role: 'technician',
  });
  await insertRow('profiles', {
    id: robertoId,
    company_id: companyId,
    full_name: 'Roberto Mendes',
    role: 'manager',
  });
  console.log('   ✅ Profiles created');

  // 4. Service Category
  console.log('\n4️⃣  Creating service category...');
  await insertRow('service_categories', {
    id: 'hvac',
    name: 'HVAC / Ar-Condicionado',
    template_id: 'hvac-pmoc-v1',
    active: true,
  });
  console.log('   ✅ HVAC category');

  // 5. Service Orders
  console.log('\n5️⃣  Creating service orders...');
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const in3days = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  await insertRow('service_orders', {
    company_id: companyId,
    technician_id: carlosId,
    status: 'pending',
    scheduled_date: today,
    store_name: 'Loja Renner',
    store_contact: 'gerente@renner.com.br',
    shopping_name: 'Shopping Center Norte',
    equipment_model: 'Split Inverter Samsung AR24',
    equipment_capacity: '36000 BTU',
    equipment_location: 'Teto da loja, acesso pela escada do corredor de serviço',
    service_category: 'hvac',
    service_type: 'preventive',
    notes: 'Revisão semestral PMOC. Filtros foram trocados na última visita (setembro).',
  });

  await insertRow('service_orders', {
    company_id: companyId,
    technician_id: carlosId,
    status: 'pending',
    scheduled_date: tomorrow,
    store_name: 'Starbucks',
    shopping_name: 'Shopping Iguatemi',
    equipment_model: 'Multi-Split LG Multi V 5',
    equipment_capacity: '48000 BTU',
    equipment_location: 'Casa de máquinas no 3º subsolo, box 12',
    service_category: 'hvac',
    service_type: 'corrective',
    notes: 'Lojista relatou que ar não está gelando. Última manutenção há 4 meses.',
  });

  await insertRow('service_orders', {
    company_id: companyId,
    technician_id: carlosId,
    status: 'pending',
    scheduled_date: in3days,
    store_name: 'Lojas Americanas',
    store_contact: 'manutencao@americanas.com',
    shopping_name: 'Shopping Morumbi',
    equipment_model: 'Cassete Daikin FXFQ60P',
    equipment_capacity: '60000 BTU',
    equipment_location: 'Forro da área de vendas, 4 unidades evaporadoras',
    service_category: 'hvac',
    service_type: 'preventive',
    notes: 'Primeira revisão após instalação. Verificar todos os pontos do PMOC.',
  });
  console.log('   ✅ 3 service orders created');

  console.log('\n✅ Setup completo!\n');
  console.log('Credenciais de demo:');
  console.log('  Técnico: carlos@techfrio.com / demo123');
  console.log('  Gestor:  roberto@techfrio.com / demo123');
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
