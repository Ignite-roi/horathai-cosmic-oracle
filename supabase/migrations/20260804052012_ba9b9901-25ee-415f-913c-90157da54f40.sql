-- 1. Entitlements: read-only for owners, writes only via trusted server code
DROP POLICY IF EXISTS "Users manage their own entitlement" ON public.entitlements;
CREATE POLICY "Owners can read their entitlement"
  ON public.entitlements FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
REVOKE INSERT, UPDATE, DELETE ON public.entitlements FROM authenticated;
GRANT SELECT ON public.entitlements TO authenticated;
GRANT ALL ON public.entitlements TO service_role;

-- 2. Gamification: read-only for owners
DROP POLICY IF EXISTS "Users manage their own gamification" ON public.gamification;
CREATE POLICY "Owners can read their gamification"
  ON public.gamification FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
REVOKE INSERT, UPDATE, DELETE ON public.gamification FROM authenticated;
GRANT SELECT ON public.gamification TO authenticated;
GRANT ALL ON public.gamification TO service_role;

-- 3. Gamification event log
CREATE TABLE IF NOT EXISTS public.gamification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  points_delta integer NOT NULL DEFAULT 0,
  event_date date NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gamification_events TO authenticated;
GRANT ALL ON public.gamification_events TO service_role;
ALTER TABLE public.gamification_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners can read their gamification events" ON public.gamification_events;
CREATE POLICY "Owners can read their gamification events"
  ON public.gamification_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE UNIQUE INDEX IF NOT EXISTS gamification_events_daily_unique
  ON public.gamification_events (user_id, event_type, event_date);

-- 4. Authentication audit log (server-only)
CREATE TABLE IF NOT EXISTS public.auth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'line',
  event_type text NOT NULL,
  success boolean NOT NULL DEFAULT true,
  error_code text,
  ip_hash text,
  user_agent_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.auth_events TO service_role;
ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS auth_events_user_idx ON public.auth_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS auth_events_ip_idx ON public.auth_events (ip_hash, created_at DESC);

-- 5. Atomic daily check-in in Asia/Bangkok time, server clock only
CREATE OR REPLACE FUNCTION public.daily_check_in(_user_id uuid)
RETURNS TABLE (points integer, streak integer, reward integer, already_checked_in boolean, event_date date)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _today date := (now() AT TIME ZONE 'Asia/Bangkok')::date;
  _row public.gamification%ROWTYPE;
  _reward integer := 0;
  _new_streak integer := 1;
BEGIN
  INSERT INTO public.gamification (user_id) VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO _row FROM public.gamification WHERE user_id = _user_id FOR UPDATE;

  IF _row.last_check_in = _today THEN
    RETURN QUERY SELECT _row.points, _row.streak, 0, true, _today;
    RETURN;
  END IF;

  IF _row.last_check_in = _today - 1 THEN
    _new_streak := _row.streak + 1;
  END IF;

  _reward := 10 + LEAST(_new_streak, 7) * 2;

  BEGIN
    INSERT INTO public.gamification_events (user_id, event_type, points_delta, event_date, metadata)
    VALUES (_user_id, 'daily_check_in', _reward, _today, jsonb_build_object('streak', _new_streak));
  EXCEPTION WHEN unique_violation THEN
    SELECT * INTO _row FROM public.gamification WHERE user_id = _user_id;
    RETURN QUERY SELECT _row.points, _row.streak, 0, true, _today;
    RETURN;
  END;

  UPDATE public.gamification
     SET points = points + _reward,
         streak = _new_streak,
         last_check_in = _today
   WHERE user_id = _user_id
   RETURNING * INTO _row;

  RETURN QUERY SELECT _row.points, _row.streak, _reward, false, _today;
END;
$$;
REVOKE ALL ON FUNCTION public.daily_check_in(uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.daily_check_in(uuid) TO service_role;

-- 6. Birth profile: additive fields
ALTER TABLE public.birth_profiles
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'TH',
  ADD COLUMN IF NOT EXISTS locality text,
  ADD COLUMN IF NOT EXISTS utc_birth_datetime timestamptz,
  ADD COLUMN IF NOT EXISTS birth_time_estimated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS calculation_settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS calculation_version text NOT NULL DEFAULT 'v1';
ALTER TABLE public.birth_profiles ALTER COLUMN calculation_system SET DEFAULT 'sidereal_lahiri_dev';
UPDATE public.birth_profiles SET calculation_system = 'sidereal_lahiri_dev' WHERE calculation_system = 'suriyayart';
UPDATE public.birth_profiles SET birth_time_estimated = true WHERE birth_time_known = false;

-- 7. Natal chart snapshots: additive fields
ALTER TABLE public.natal_charts
  ADD COLUMN IF NOT EXISTS engine_type text NOT NULL DEFAULT 'sidereal_lahiri_dev',
  ADD COLUMN IF NOT EXISTS input_snapshot_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS aspects_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS calculation_settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS superseded_at timestamptz;