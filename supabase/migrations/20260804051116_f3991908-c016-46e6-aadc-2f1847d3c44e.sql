ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS picture_url text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

UPDATE public.profiles SET onboarding_completed = onboarded WHERE onboarding_completed IS DISTINCT FROM onboarded;
UPDATE public.profiles SET picture_url = avatar_url WHERE picture_url IS NULL AND avatar_url IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.birth_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL DEFAULT '',
  birth_date date NOT NULL,
  birth_time time,
  birth_time_known boolean NOT NULL DEFAULT true,
  country text NOT NULL DEFAULT 'ประเทศไทย',
  province text NOT NULL DEFAULT 'กรุงเทพมหานคร',
  district text,
  latitude double precision NOT NULL DEFAULT 13.75,
  longitude double precision NOT NULL DEFAULT 100.5,
  timezone text NOT NULL DEFAULT 'Asia/Bangkok',
  calculation_system text NOT NULL DEFAULT 'suriyayart',
  is_primary boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.birth_profiles TO authenticated;
GRANT ALL ON public.birth_profiles TO service_role;
ALTER TABLE public.birth_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own birth profiles" ON public.birth_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS birth_profiles_user_idx ON public.birth_profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS birth_profiles_primary_idx ON public.birth_profiles(user_id) WHERE is_primary;

CREATE TRIGGER update_birth_profiles_updated_at BEFORE UPDATE ON public.birth_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.natal_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  birth_profile_id uuid NOT NULL REFERENCES public.birth_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ascendant_sign text NOT NULL,
  ascendant_degree double precision NOT NULL DEFAULT 0,
  planets_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  houses_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  standards_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculation_version text NOT NULL DEFAULT 'v1',
  calculated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.natal_charts TO authenticated;
GRANT ALL ON public.natal_charts TO service_role;
ALTER TABLE public.natal_charts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own natal charts" ON public.natal_charts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS natal_charts_profile_idx ON public.natal_charts(birth_profile_id);