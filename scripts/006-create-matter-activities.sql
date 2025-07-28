CREATE TABLE IF NOT EXISTS public.matter_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  matter_id UUID REFERENCES public.matters(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('note', 'call', 'email', 'meeting', 'document', 'task', 'update')),
  description TEXT NOT NULL,
  details TEXT,
  user_name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matter_activities_matter_id ON public.matter_activities(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_activities_user_id ON public.matter_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_matter_activities_timestamp ON public.matter_activities(timestamp DESC);
