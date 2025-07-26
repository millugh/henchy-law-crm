DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs" ON audit_logs
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" ON audit_logs
FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION log_audit_event(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION audit_trigger_function() RETURNS TRIGGER AS $$
DECLARE
  old_values JSONB;
  new_values JSONB;
  action_type TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_type := 'CREATE';
    new_values := to_jsonb(NEW);
    old_values := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'UPDATE';
    old_values := to_jsonb(OLD);
    new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
    old_values := to_jsonb(OLD);
    new_values := NULL;
  END IF;

  PERFORM log_audit_event(
    action_type,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    old_values,
    new_values
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_matters_trigger
  AFTER INSERT OR UPDATE OR DELETE ON matters
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_time_entries_trigger
  AFTER INSERT OR UPDATE OR DELETE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_tasks_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_documents_trigger
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TABLE IF EXISTS letter_templates CASCADE;

CREATE TABLE IF NOT EXISTS letter_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE letter_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view letter templates" ON letter_templates
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create letter templates" ON letter_templates
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update letter templates" ON letter_templates
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete letter templates" ON letter_templates
FOR DELETE USING (auth.role() = 'authenticated');

DROP TABLE IF EXISTS contract_templates CASCADE;

CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view contract templates" ON contract_templates
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create contract templates" ON contract_templates
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update contract templates" ON contract_templates
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete contract templates" ON contract_templates
FOR DELETE USING (auth.role() = 'authenticated');

CREATE TRIGGER update_letter_templates_updated_at
  BEFORE UPDATE ON letter_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_templates_updated_at
  BEFORE UPDATE ON contract_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_letter_templates_trigger
  AFTER INSERT OR UPDATE OR DELETE ON letter_templates
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_contract_templates_trigger
  AFTER INSERT OR UPDATE OR DELETE ON contract_templates
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX idx_letter_templates_category ON letter_templates(category);
CREATE INDEX idx_letter_templates_created_by ON letter_templates(created_by);
CREATE INDEX idx_letter_templates_created_at ON letter_templates(created_at);

CREATE INDEX idx_contract_templates_category ON contract_templates(category);
CREATE INDEX idx_contract_templates_created_by ON contract_templates(created_by);
CREATE INDEX idx_contract_templates_created_at ON contract_templates(created_at);

INSERT INTO letter_templates (name, category, description, tags, content) VALUES
('Standard Engagement Letter', 'Client Onboarding', 'Standard engagement letter for new clients', ARRAY['engagement', 'client', 'onboarding'], 
'Dear {{client.name}},

Thank you for choosing {{user.name}} to represent you in your legal matter. This letter confirms our engagement and outlines the terms of our representation.

Matter: {{matter.name}}
Matter ID: {{matter.id}}

We look forward to working with you.

Sincerely,
{{user.name}}
{{user.title}}'),

('Demand Letter Template', 'Litigation', 'Template for demand letters in collection matters', ARRAY['demand', 'collection', 'litigation'],
'{{current.date}}

{{client.name}}
{{client.address}}

RE: Demand for Payment

Dear {{client.primaryContact.name}},

This letter serves as formal demand for payment of outstanding amounts owed.

Please remit payment within 30 days of receipt of this letter.

Sincerely,
{{user.name}}
{{user.title}}');

INSERT INTO contract_templates (name, category, description, tags, content) VALUES
('Service Agreement Template', 'Business', 'Standard service agreement template for business clients', ARRAY['service', 'agreement', 'business'],
'SERVICE AGREEMENT

This Service Agreement is entered into on {{current.date}} between {{client.name}} and the service provider.

Terms and Conditions:
1. Scope of Services
2. Payment Terms
3. Term and Termination

Client: {{client.name}}
Address: {{client.address}}

Agreed to by:
{{user.name}}
{{user.title}}'),

('Real Estate Purchase Agreement', 'Real Estate', 'Template for real estate purchase agreements', ARRAY['real estate', 'purchase', 'property'],
'REAL ESTATE PURCHASE AGREEMENT

Property Address: {{matter.propertyAddress}}
Purchase Price: $[AMOUNT]

Buyer: {{client.name}}
Seller: [SELLER NAME]

Terms:
1. Purchase Price and Payment
2. Closing Date
3. Contingencies

This agreement is subject to the terms and conditions set forth herein.

Date: {{current.date}}');
