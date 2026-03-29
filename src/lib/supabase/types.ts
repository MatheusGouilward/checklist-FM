export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          company_id: string;
          full_name: string;
          role: 'technician' | 'manager';
          created_at: string;
        };
        Insert: {
          id: string;
          company_id: string;
          full_name: string;
          role: 'technician' | 'manager';
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          full_name?: string;
          role?: 'technician' | 'manager';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
        ];
      };
      service_categories: {
        Row: {
          id: string;
          name: string;
          template_id: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          template_id: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          template_id?: string;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      service_orders: {
        Row: {
          id: string;
          company_id: string;
          technician_id: string;
          status: 'pending' | 'in_progress' | 'completed';
          scheduled_date: string;
          store_name: string;
          store_contact: string | null;
          shopping_name: string;
          equipment_model: string;
          equipment_capacity: string;
          equipment_location: string | null;
          service_category: string;
          service_type: 'preventive' | 'corrective' | 'installation';
          notes: string | null;
          checklist_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          technician_id: string;
          status?: 'pending' | 'in_progress' | 'completed';
          scheduled_date: string;
          store_name: string;
          store_contact?: string | null;
          shopping_name: string;
          equipment_model: string;
          equipment_capacity: string;
          equipment_location?: string | null;
          service_category: string;
          service_type: 'preventive' | 'corrective' | 'installation';
          notes?: string | null;
          checklist_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          technician_id?: string;
          status?: 'pending' | 'in_progress' | 'completed';
          scheduled_date?: string;
          store_name?: string;
          store_contact?: string | null;
          shopping_name?: string;
          equipment_model?: string;
          equipment_capacity?: string;
          equipment_location?: string | null;
          service_category?: string;
          service_type?: 'preventive' | 'corrective' | 'installation';
          notes?: string | null;
          checklist_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'service_orders_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'service_orders_technician_id_fkey';
            columns: ['technician_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'service_orders_checklist_id_fkey';
            columns: ['checklist_id'];
            isOneToOne: true;
            referencedRelation: 'checklists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'service_orders_service_category_fkey';
            columns: ['service_category'];
            isOneToOne: false;
            referencedRelation: 'service_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      checklists: {
        Row: {
          id: string;
          company_id: string;
          technician_id: string;
          technician_name: string;
          service_order_id: string | null;
          status: 'draft' | 'in_progress' | 'completed';
          service_result: 'ok' | 'pending_issue' | 'return_needed' | null;
          store_name: string;
          shopping_name: string;
          equipment_model: string;
          equipment_capacity: string;
          service_type: 'preventive' | 'corrective' | 'installation';
          sections: unknown;
          observations: string;
          return_justification: string | null;
          signature: string | null;
          created_at: string;
          completed_at: string | null;
          synced_at: string | null;
        };
        Insert: {
          id: string;
          company_id: string;
          technician_id: string;
          technician_name: string;
          service_order_id?: string | null;
          status?: 'draft' | 'in_progress' | 'completed';
          service_result?: 'ok' | 'pending_issue' | 'return_needed' | null;
          store_name: string;
          shopping_name: string;
          equipment_model: string;
          equipment_capacity: string;
          service_type: 'preventive' | 'corrective' | 'installation';
          sections?: unknown;
          observations?: string;
          return_justification?: string | null;
          signature?: string | null;
          created_at?: string;
          completed_at?: string | null;
          synced_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          technician_id?: string;
          technician_name?: string;
          service_order_id?: string | null;
          status?: 'draft' | 'in_progress' | 'completed';
          service_result?: 'ok' | 'pending_issue' | 'return_needed' | null;
          store_name?: string;
          shopping_name?: string;
          equipment_model?: string;
          equipment_capacity?: string;
          service_type?: 'preventive' | 'corrective' | 'installation';
          sections?: unknown;
          observations?: string;
          return_justification?: string | null;
          signature?: string | null;
          created_at?: string;
          completed_at?: string | null;
          synced_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'checklists_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'checklists_technician_id_fkey';
            columns: ['technician_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'checklists_service_order_id_fkey';
            columns: ['service_order_id'];
            isOneToOne: true;
            referencedRelation: 'service_orders';
            referencedColumns: ['id'];
          },
        ];
      };
      photos: {
        Row: {
          id: string;
          checklist_id: string;
          item_id: string;
          storage_path: string;
          timestamp: string;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          checklist_id: string;
          item_id: string;
          storage_path: string;
          timestamp: string;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          checklist_id?: string;
          item_id?: string;
          storage_path?: string;
          timestamp?: string;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'photos_checklist_id_fkey';
            columns: ['checklist_id'];
            isOneToOne: false;
            referencedRelation: 'checklists';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}