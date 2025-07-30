CREATE TABLE IF NOT EXISTS public.phone_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  caller_number TEXT NOT NULL,
  callee_number TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in seconds
  status TEXT NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'connected', 'completed', 'missed', 'failed')),
  recording_url TEXT,
  call_id_3cx TEXT, -- 3CX internal call ID
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.voicemails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  call_id UUID REFERENCES public.phone_calls(id) ON DELETE CASCADE,
  caller_number TEXT NOT NULL,
  voicemail_url TEXT NOT NULL,
  transcription TEXT,
  duration INTEGER, -- Duration in seconds
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phone_calls_user_id ON public.phone_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_calls_client_id ON public.phone_calls(client_id);
CREATE INDEX IF NOT EXISTS idx_phone_calls_start_time ON public.phone_calls(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_phone_calls_status ON public.phone_calls(status);
CREATE INDEX IF NOT EXISTS idx_phone_calls_direction ON public.phone_calls(direction);
CREATE INDEX IF NOT EXISTS idx_phone_calls_caller_number ON public.phone_calls(caller_number);

CREATE INDEX IF NOT EXISTS idx_voicemails_user_id ON public.voicemails(user_id);
CREATE INDEX IF NOT EXISTS idx_voicemails_call_id ON public.voicemails(call_id);
CREATE INDEX IF NOT EXISTS idx_voicemails_timestamp ON public.voicemails(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_voicemails_is_read ON public.voicemails(is_read);
CREATE INDEX IF NOT EXISTS idx_voicemails_caller_number ON public.voicemails(caller_number);

CREATE TABLE IF NOT EXISTS public.threecx_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  api_url TEXT NOT NULL,
  api_username TEXT NOT NULL,
  api_password TEXT NOT NULL,
  webhook_secret TEXT NOT NULL,
  default_extension TEXT,
  recording_enabled BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
