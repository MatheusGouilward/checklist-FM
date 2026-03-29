-- ============================================================
-- Vobi Checklist MVP — Row Level Security Policies
-- ============================================================
-- Habilita RLS em todas as tabelas e define políticas de acesso.
-- Técnicos veem apenas seus dados; Gestores veem tudo da empresa.

-- === COMPANIES ===
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- === PROFILES ===
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles in their company"
  ON profiles FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- === SERVICE_CATEGORIES ===
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view categories"
  ON service_categories FOR SELECT
  TO authenticated
  USING (true);

-- === SERVICE_ORDERS ===
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;

-- Técnico: vê apenas as OS atribuídas a ele
CREATE POLICY "Technicians can view their own orders"
  ON service_orders FOR SELECT
  USING (
    technician_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'manager'
        AND company_id = service_orders.company_id
    )
  );

-- Técnico: pode atualizar status e checklist_id das suas OS
CREATE POLICY "Technicians can update their own orders"
  ON service_orders FOR UPDATE
  USING (technician_id = auth.uid())
  WITH CHECK (technician_id = auth.uid());

-- Gestor: pode criar OS para sua empresa
CREATE POLICY "Managers can insert orders for their company"
  ON service_orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'manager'
        AND company_id = service_orders.company_id
    )
  );

-- === CHECKLISTS ===
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

-- Técnico: vê apenas seus checklists
-- Gestor: vê todos da empresa
CREATE POLICY "Users can view relevant checklists"
  ON checklists FOR SELECT
  USING (
    technician_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'manager'
        AND company_id = checklists.company_id
    )
  );

CREATE POLICY "Technicians can insert their own checklists"
  ON checklists FOR INSERT
  WITH CHECK (technician_id = auth.uid());

CREATE POLICY "Technicians can update their own checklists"
  ON checklists FOR UPDATE
  USING (technician_id = auth.uid())
  WITH CHECK (technician_id = auth.uid());

-- === PHOTOS ===
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view photos from their checklists"
  ON photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = photos.checklist_id
        AND (
          checklists.technician_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
              AND role = 'manager'
              AND company_id = checklists.company_id
          )
        )
    )
  );

CREATE POLICY "Technicians can insert photos for their checklists"
  ON photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = photos.checklist_id
        AND checklists.technician_id = auth.uid()
    )
  );

-- === STORAGE BUCKET ===
-- Criar bucket 'checklist-photos' como privado no Supabase Dashboard.
-- Policies de storage:

-- INSERT: técnico pode fazer upload para sua pasta
-- SELECT: técnico + gestor da empresa podem ver
-- DELETE: apenas o próprio técnico
