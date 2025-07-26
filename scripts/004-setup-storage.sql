
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

INSERT INTO storage.buckets (id, name, public)
VALUES ('templates', 'templates', false);

INSERT INTO storage.buckets (id, name, public)
VALUES ('client-files', 'client-files', false);

CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "All users can view templates" ON storage.objects
FOR SELECT USING (bucket_id = 'templates');

CREATE POLICY "Authenticated users can upload templates" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'templates' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update templates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'templates' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view client files they have access to" ON storage.objects
FOR SELECT USING (
  bucket_id = 'client-files' AND 
  EXISTS (
    SELECT 1 FROM matters m
    WHERE m.client_id::text = (storage.foldername(name))[1]
    AND m.assigned_attorney = auth.uid()
  )
);

CREATE POLICY "Users can upload client files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'client-files' AND 
  EXISTS (
    SELECT 1 FROM matters m
    WHERE m.client_id::text = (storage.foldername(name))[1]
    AND m.assigned_attorney = auth.uid()
  )
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  bucket_name TEXT NOT NULL,
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents for their matters" ON documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM matters m
    WHERE m.id = documents.matter_id
    AND m.assigned_attorney = auth.uid()
  )
  OR uploaded_by = auth.uid()
);

CREATE POLICY "Users can insert documents for their matters" ON documents
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM matters m
    WHERE m.id = documents.matter_id
    AND m.assigned_attorney = auth.uid()
  )
  OR uploaded_by = auth.uid()
);

CREATE POLICY "Users can update documents for their matters" ON documents
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM matters m
    WHERE m.id = documents.matter_id
    AND m.assigned_attorney = auth.uid()
  )
  OR uploaded_by = auth.uid()
);

CREATE POLICY "Users can delete documents for their matters" ON documents
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM matters m
    WHERE m.id = documents.matter_id
    AND m.assigned_attorney = auth.uid()
  )
  OR uploaded_by = auth.uid()
);

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_documents_matter_id ON documents(matter_id);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON documents(created_at);
