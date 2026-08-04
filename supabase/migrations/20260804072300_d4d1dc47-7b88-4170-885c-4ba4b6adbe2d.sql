ALTER TABLE public.natal_charts
  ADD COLUMN IF NOT EXISTS input_hash text,
  ADD COLUMN IF NOT EXISTS utc_birth_datetime timestamp with time zone,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Asia/Bangkok',
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS house_system text NOT NULL DEFAULT 'whole_sign',
  ADD COLUMN IF NOT EXISTS ayanamsa double precision,
  ADD COLUMN IF NOT EXISTS ascendant_known boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ascendant_json jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS natal_charts_input_hash_idx ON public.natal_charts (user_id, input_hash);