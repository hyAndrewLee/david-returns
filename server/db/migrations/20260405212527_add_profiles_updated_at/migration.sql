-- Add missing updated_at to profiles for Drizzle schema parity
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill nulls on existing rows
UPDATE public.profiles
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- Keep updated_at current on row updates
CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at_trigger ON public.profiles;

CREATE TRIGGER set_profiles_updated_at_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_profiles_updated_at();
