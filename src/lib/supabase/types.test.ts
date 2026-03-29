import { describe, it, expect } from 'vitest';
import type { Database } from './types';

describe('Supabase Database types', () => {
  it('defines companies table shape', () => {
    const row: Database['public']['Tables']['companies']['Row'] = {
      id: 'uuid-1',
      name: 'Vobi HVAC',
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(row.name).toBe('Vobi HVAC');
  });

  it('defines profiles table with role constraint', () => {
    const row: Database['public']['Tables']['profiles']['Row'] = {
      id: 'user-1',
      company_id: 'comp-1',
      full_name: 'João Silva',
      role: 'technician',
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(row.role).toBe('technician');
  });

  it('defines checklists table with all fields', () => {
    const row: Database['public']['Tables']['checklists']['Row'] = {
      id: 'cl-1',
      company_id: 'comp-1',
      technician_id: 'user-1',
      technician_name: 'João',
      service_order_id: 'so-1',
      status: 'completed',
      service_result: 'ok',
      store_name: 'Loja A',
      shopping_name: 'Shopping X',
      equipment_model: 'Split',
      equipment_capacity: '36000 BTU',
      service_type: 'preventive',
      sections: [],
      observations: '',
      return_justification: null,
      signature: null,
      created_at: '2026-01-01T00:00:00Z',
      completed_at: '2026-01-01T10:00:00Z',
      synced_at: '2026-01-01T10:01:00Z',
    };
    expect(row.status).toBe('completed');
    expect(row.service_result).toBe('ok');
  });

  it('defines photos table with geolocation', () => {
    const row: Database['public']['Tables']['photos']['Row'] = {
      id: 'photo-1',
      checklist_id: 'cl-1',
      item_id: 'filter-condition',
      storage_path: 'comp-1/cl-1/photo-1.jpg',
      timestamp: '2026-01-01T10:30:00Z',
      latitude: -23.55052,
      longitude: -46.633309,
      created_at: '2026-01-01T10:30:00Z',
    };
    expect(row.latitude).toBe(-23.55052);
  });

  it('allows nullable service_result for insert', () => {
    const insert: Database['public']['Tables']['checklists']['Insert'] = {
      id: 'cl-1',
      company_id: 'comp-1',
      technician_id: 'user-1',
      technician_name: 'João',
      store_name: 'Loja A',
      shopping_name: 'Shopping X',
      equipment_model: 'Split',
      equipment_capacity: '36000 BTU',
      service_type: 'preventive',
      service_result: null,
    };
    expect(insert.service_result).toBeNull();
  });

  it('defines service_orders table shape', () => {
    const row: Database['public']['Tables']['service_orders']['Row'] = {
      id: 'so-1',
      company_id: 'comp-1',
      technician_id: 'user-1',
      status: 'pending',
      scheduled_date: '2026-03-28',
      store_name: 'Loja A',
      store_contact: null,
      shopping_name: 'Shopping X',
      equipment_model: 'Split Inverter',
      equipment_capacity: '36000 BTU',
      equipment_location: null,
      service_category: 'hvac',
      service_type: 'preventive',
      notes: null,
      checklist_id: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    expect(row.status).toBe('pending');
    expect(row.service_type).toBe('preventive');
  });

  it('defines service_categories table shape', () => {
    const row: Database['public']['Tables']['service_categories']['Row'] = {
      id: 'hvac',
      name: 'HVAC / Ar-Condicionado',
      template_id: 'hvac-pmoc-v1',
      active: true,
      created_at: '2026-01-01T00:00:00Z',
    };
    expect(row.id).toBe('hvac');
    expect(row.active).toBe(true);
  });
});