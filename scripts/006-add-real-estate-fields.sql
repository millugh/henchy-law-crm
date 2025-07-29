ALTER TABLE public.matters 
ADD COLUMN IF NOT EXISTS property_address TEXT,
ADD COLUMN IF NOT EXISTS matter_subtype TEXT;

UPDATE public.matters SET matter_subtype = matter_type WHERE matter_subtype IS NULL;
