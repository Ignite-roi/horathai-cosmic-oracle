CREATE TYPE public.credit_transaction_type AS ENUM ('purchase', 'referral', 'transfer_in', 'transfer_out', 'bonus', 'admin');
CREATE TYPE public.referral_status AS ENUM ('pending', 'qualified', 'awarded', 'cancelled');

CREATE TABLE public.user_credits (
  user_id uuid PRIMARY KEY,
  days_remaining integer NOT NULL DEFAULT 0 CHECK (days_remaining >= 0),
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_credits TO authenticated;
GRANT ALL ON public.user_credits TO service_role;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own day credits" ON public.user_credits FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.credit_transaction_type NOT NULL,
  days integer NOT NULL CHECK (days <> 0),
  points_used integer NOT NULL DEFAULT 0 CHECK (points_used >= 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX credit_transactions_user_created_idx ON public.credit_transactions (user_id, created_at DESC);

CREATE TABLE public.packages (
  code text PRIMARY KEY CHECK (code ~ '^[a-z0-9_]+$'),
  name_th text NOT NULL,
  days integer NOT NULL CHECK (days > 0),
  price_thb integer NOT NULL CHECK (price_thb >= 0),
  bonus_days integer NOT NULL DEFAULT 0 CHECK (bonus_days >= 0),
  is_popular boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.packages TO anon, authenticated;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active package catalog" ON public.packages FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.referral_codes (
  user_id uuid PRIMARY KEY,
  code varchar(12) NOT NULL UNIQUE CHECK (code ~ '^[0-9]{12}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_codes TO authenticated;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referral code" ON public.referral_codes FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referee_id uuid NOT NULL UNIQUE,
  status public.referral_status NOT NULL DEFAULT 'pending',
  points_awarded integer NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (referrer_id <> referee_id)
);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view referrals involving them" ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referee_id);
CREATE INDEX referrals_referrer_created_idx ON public.referrals (referrer_id, created_at DESC);

CREATE TABLE public.user_points (
  user_id uuid PRIMARY KEY,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0)
);
GRANT SELECT ON public.user_points TO authenticated;
GRANT ALL ON public.user_points TO service_role;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own points" ON public.user_points FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_referral_code(_user_id uuid)
RETURNS varchar
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code varchar(12);
BEGIN
  LOOP
    _code := lpad((('x' || substr(md5(_user_id::text || clock_timestamp()::text || random()::text), 1, 12))::bit(48)::bigint % 1000000000000)::text, 12, '0');
    BEGIN
      INSERT INTO public.referral_codes (user_id, code) VALUES (_user_id, _code)
      ON CONFLICT (user_id) DO NOTHING;
      SELECT code INTO _code FROM public.referral_codes WHERE user_id = _user_id;
      RETURN _code;
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.generate_referral_code(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_referral_code(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.grant_user_days(
  _user_id uuid,
  _days integer,
  _type public.credit_transaction_type,
  _points_used integer DEFAULT 0,
  _note text DEFAULT NULL
)
RETURNS public.user_credits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _credit public.user_credits%ROWTYPE;
BEGIN
  IF _days <= 0 THEN RAISE EXCEPTION 'Days must be positive'; END IF;
  IF _points_used < 0 THEN RAISE EXCEPTION 'Points used cannot be negative'; END IF;

  INSERT INTO public.user_credits (user_id, days_remaining, expires_at)
  VALUES (_user_id, _days, now() + make_interval(days => _days))
  ON CONFLICT (user_id) DO UPDATE
    SET days_remaining = public.user_credits.days_remaining + _days,
        expires_at = GREATEST(COALESCE(public.user_credits.expires_at, now()), now()) + make_interval(days => _days),
        updated_at = now()
  RETURNING * INTO _credit;

  INSERT INTO public.credit_transactions (user_id, type, days, points_used, note)
  VALUES (_user_id, _type, _days, _points_used, _note);
  RETURN _credit;
END;
$$;
REVOKE ALL ON FUNCTION public.grant_user_days(uuid, integer, public.credit_transaction_type, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_user_days(uuid, integer, public.credit_transaction_type, integer, text) TO service_role;

CREATE OR REPLACE FUNCTION public.deduct_user_days(
  _user_id uuid,
  _days integer,
  _type public.credit_transaction_type DEFAULT 'admin',
  _note text DEFAULT NULL
)
RETURNS public.user_credits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _credit public.user_credits%ROWTYPE;
BEGIN
  IF _days <= 0 THEN RAISE EXCEPTION 'Days must be positive'; END IF;
  SELECT * INTO _credit FROM public.user_credits WHERE user_id = _user_id FOR UPDATE;
  IF NOT FOUND OR _credit.days_remaining < _days THEN RAISE EXCEPTION 'Insufficient day credit'; END IF;

  UPDATE public.user_credits
  SET days_remaining = days_remaining - _days,
      expires_at = CASE WHEN days_remaining - _days = 0 THEN now() ELSE expires_at - make_interval(days => _days) END,
      updated_at = now()
  WHERE user_id = _user_id
  RETURNING * INTO _credit;

  INSERT INTO public.credit_transactions (user_id, type, days, note)
  VALUES (_user_id, _type, -_days, _note);
  RETURN _credit;
END;
$$;
REVOKE ALL ON FUNCTION public.deduct_user_days(uuid, integer, public.credit_transaction_type, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_user_days(uuid, integer, public.credit_transaction_type, text) TO service_role;

CREATE OR REPLACE FUNCTION public.complete_mock_day_purchase(
  _user_id uuid,
  _package_code text,
  _points_to_use integer DEFAULT 0
)
RETURNS TABLE(days_remaining integer, expires_at timestamptz, points_balance integer, days_added integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _package public.packages%ROWTYPE;
  _points integer;
  _credit public.user_credits%ROWTYPE;
  _total_days integer;
BEGIN
  IF _points_to_use < 0 THEN RAISE EXCEPTION 'Points cannot be negative'; END IF;
  SELECT * INTO _package FROM public.packages WHERE code = _package_code;
  IF NOT FOUND THEN RAISE EXCEPTION 'Package not found'; END IF;

  INSERT INTO public.user_points (user_id, balance) VALUES (_user_id, 0) ON CONFLICT (user_id) DO NOTHING;
  SELECT balance INTO _points FROM public.user_points WHERE user_id = _user_id FOR UPDATE;
  IF _points_to_use > _points THEN RAISE EXCEPTION 'Insufficient points'; END IF;
  UPDATE public.user_points SET balance = balance - _points_to_use WHERE user_id = _user_id RETURNING balance INTO _points;

  _total_days := _package.days + _package.bonus_days;
  SELECT * INTO _credit FROM public.grant_user_days(
    _user_id,
    _total_days,
    'purchase',
    _points_to_use,
    'ชำระผ่านผู้ให้บริการจำลอง · ' || _package.name_th
  );

  RETURN QUERY SELECT _credit.days_remaining, _credit.expires_at, _points, _total_days;
END;
$$;
REVOKE ALL ON FUNCTION public.complete_mock_day_purchase(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_mock_day_purchase(uuid, text, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, line_user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'line_user_id',
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'ผู้เดินทางแห่งดวงดาว'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.entitlements (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.gamification (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_credits (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_points (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  PERFORM public.generate_referral_code(NEW.id);
  RETURN NEW;
END;
$$;

INSERT INTO public.packages (code, name_th, days, price_thb, bonus_days, is_popular, sort_order) VALUES
  ('starlight_7', 'แสงดาว 7 วัน', 7, 79, 0, false, 10),
  ('orbit_30', 'วงโคจร 30 วัน', 30, 249, 3, false, 20),
  ('cosmos_90', 'จักรวาล 90 วัน', 90, 599, 15, true, 30),
  ('eternity_365', 'นิรันดร์ 365 วัน', 365, 1790, 60, false, 40);

INSERT INTO public.user_credits (user_id)
SELECT id FROM public.profiles ON CONFLICT (user_id) DO NOTHING;
INSERT INTO public.user_points (user_id)
SELECT id FROM public.profiles ON CONFLICT (user_id) DO NOTHING;
SELECT public.generate_referral_code(id) FROM public.profiles;