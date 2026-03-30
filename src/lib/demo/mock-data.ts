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
 * Store logo mapping — maps store names to their logo paths in /public/logos/.
 * Used by ServiceOrderCard to show real brand logos instead of initials.
 * In production, this would come from the service_orders or stores table.
 */
export const STORE_LOGOS: Record<string, string> = {
  'Loja Renner': '/logos/renner.png',
  'Starbucks': '/logos/starbucks.png',
  'Lojas Americanas': '/logos/americanas.png',
  'Natura': '/logos/natura.png',
  'C&A': '/logos/cea.png',
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
    scheduledDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    storeName: 'Natura',
    storeContact: 'loja.natura@shopping.com.br',
    shoppingName: 'Shopping Center Norte',
    equipmentModel: 'Split Piso-Teto Carrier 40MBC',
    equipmentCapacity: '48.000 BTU',
    serviceCategory: 'hvac',
    serviceType: 'preventive',
    checklistId: 'cccccccc-cccc-cccc-cccc-cccccccccc01',
    notes: 'Manutenção preventiva semestral concluída.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05',
    companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    technicianId: '11111111-1111-1111-1111-111111111111',
    status: 'pending',
    scheduledDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    storeName: 'C&A',
    storeContact: 'manutencao@cea.com.br',
    shoppingName: 'Shopping Iguatemi',
    equipmentModel: 'VRF Midea V8 Series',
    equipmentCapacity: '80.000 BTU',
    equipmentLocation: 'Rooftop, acesso pela escada de emergência',
    serviceCategory: 'hvac',
    serviceType: 'corrective',
    notes: 'URGENTE: Sistema desligou sozinho 2x na última semana. Verificar placa eletrônica.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];
