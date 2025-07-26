INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own documents" ON storage.objects
  FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
