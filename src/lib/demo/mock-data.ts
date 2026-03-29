import type { AuthUser } from '@/stores/auth-store';
import type { ServiceOrderRecord } from '@/lib/db/schema';

/**
 * Mock user for demo mode — bypasses Supabase Auth entirely.
 */
export const DEMO_USER: AuthUser = {
  id: '11111111-1111-1111-1111-111111111111',
  fullName: 'Carlos Silva',
  companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  role: 'technician',
};

/**
 * Mock service orders — pre-filled by the "gestor", ready for the technician.
 * These mirror the seed.sql data for consistency.
 */
export const DEMO_SERVICE_ORDERS: ServiceOrderRecord[] = [
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    technicianId: '11111111-1111-1111-1111-111111111111',
    status: 'pending',
    scheduledDate: new Date().toISOString().split('T')[0],
    storeName: 'Loja Renner',
    storeContact: 'gerente@renner.com.br',
    shoppingName: 'Shopping Center Norte',
    equipmentModel: 'Split Inverter Samsung AR24',
    equipmentCapacity: '36.000 BTU',
    equipmentLocation: 'Teto da loja, acesso pela escada do corredor de serviço',
    serviceCategory: 'hvac',
    serviceType: 'preventive',
    notes: 'Revisão semestral PMOC. Filtros foram trocados na última visita (setembro).',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    technicianId: '11111111-1111-1111-1111-111111111111',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    storeName: 'Starbucks',
    shoppingName: 'Shopping Iguatemi',
    equipmentModel: 'Multi-Split LG Multi V 5',
    equipmentCapacity: '48.000 BTU',
    equipmentLocation: 'Casa de máquinas no 3º subsolo, box 12',
    serviceCategory: 'hvac',
    serviceType: 'corrective',
    notes: 'Lojista relatou que ar não está gelando. Última manutenção há 4 meses.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    technicianId: '11111111-1111-1111-1111-111111111111',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    storeName: 'Lojas Americanas',
    storeContact: 'manutencao@americanas.com',
    shoppingName: 'Shopping Morumbi',
    equipmentModel: 'Cassete Daikin FXFQ60P',
    equipmentCapacity: '60.000 BTU',
    equipmentLocation: 'Forro da área de vendas, 4 unidades evaporadoras',
    serviceCategory: 'hvac',
    serviceType: 'preventive',
    notes: 'Primeira revisão após instalação. Verificar todos os pontos do PMOC.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04',
    companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    technicianId: '11111111-1111-1111-1111-111111111111',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    storeName: 'Natura',
    storeContact: 'loja.natura@shopping.com',
    shoppingName: 'Shopping Center Norte',
    equipmentModel: 'Split Carrier XPower',
    equipmentCapacity: '24.000 BTU',
    equipmentLocation: 'Forro da área de atendimento',
    serviceCategory: 'hvac',
    serviceType: 'preventive',
    notes: 'Revisão trimestral concluída.',
    checklistId: 'cccccccc-cccc-cccc-cccc-cccccccccc01',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
