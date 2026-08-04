CREATE TABLE public.result_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE CHECK (length(token_hash) = 64),
  result_type text NOT NULL CHECK (result_type IN ('natal', 'compatibility', 'daily')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  payload jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at)
);
GRANT SELECT ON public.result_shares TO authenticated;
GRANT ALL ON public.result_shares TO service_role;
ALTER TABLE public.result_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own result shares" ON public.result_shares FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE INDEX result_shares_owner_created_idx ON public.result_shares(owner_id, created_at DESC);
CREATE INDEX result_shares_active_token_idx ON public.result_shares(token_hash) WHERE revoked_at IS NULL;

CREATE TABLE public.day_transfer_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  recipient_id uuid REFERENCES public.profiles(id) ON DELETE RESTRICT,
  token_hash text NOT NULL UNIQUE CHECK (length(token_hash) = 64),
  days integer NOT NULL CHECK (days > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'cancelled', 'expired')),
  expires_at timestamptz NOT NULL,
  claimed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at),
  CHECK (recipient_id IS NULL OR recipient_id <> sender_id)
);
GRANT SELECT ON public.day_transfer_claims TO authenticated;
GRANT ALL ON public.day_transfer_claims TO service_role;
ALTER TABLE public.day_transfer_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read day transfers" ON public.day_transfer_claims FOR SELECT TO authenticated USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE INDEX day_transfer_sender_created_idx ON public.day_transfer_claims(sender_id, created_at DESC);
CREATE INDEX day_transfer_pending_token_idx ON public.day_transfer_claims(token_hash) WHERE status = 'pending';

CREATE TABLE public.card_draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  draw_type text NOT NULL CHECK (draw_type IN ('yes_no', 'lucky_number')),
  draw_date date NOT NULL,
  result jsonb NOT NULL,
  activated_rule_ids uuid[] NOT NULL DEFAULT '{}',
  citations jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, draw_type, draw_date)
);
GRANT SELECT ON public.card_draws TO authenticated;
GRANT ALL ON public.card_draws TO service_role;
ALTER TABLE public.card_draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own card draws" ON public.card_draws FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE INDEX card_draws_user_created_idx ON public.card_draws(user_id, created_at DESC);

CREATE TABLE public.app_notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('daily_color', 'major_transit', 'credit_expiry')),
  channel text NOT NULL DEFAULT 'line' CHECK (channel = 'line'),
  scheduled_for timestamptz NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  idempotency_key text NOT NULL UNIQUE,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_notification_jobs TO authenticated;
GRANT ALL ON public.app_notification_jobs TO service_role;
ALTER TABLE public.app_notification_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own app notification jobs" ON public.app_notification_jobs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE INDEX app_notification_jobs_due_idx ON public.app_notification_jobs(status, scheduled_for);
CREATE INDEX app_notification_jobs_user_created_idx ON public.app_notification_jobs(user_id, created_at DESC);
CREATE TRIGGER update_app_notification_jobs_updated_at BEFORE UPDATE ON public.app_notification_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.claim_day_transfer(
  _transfer_id uuid,
  _recipient_id uuid
)
RETURNS TABLE(sender_days integer, recipient_days integer, days_transferred integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _claim public.day_transfer_claims%ROWTYPE;
  _sender public.user_credits%ROWTYPE;
  _recipient public.user_credits%ROWTYPE;
BEGIN
  SELECT * INTO _claim FROM public.day_transfer_claims WHERE id = _transfer_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transfer not found'; END IF;
  IF _claim.status <> 'pending' THEN RAISE EXCEPTION 'Transfer is not available'; END IF;
  IF _claim.expires_at <= now() THEN
    UPDATE public.day_transfer_claims SET status = 'expired' WHERE id = _claim.id;
    RAISE EXCEPTION 'Transfer expired';
  END IF;
  IF _claim.sender_id = _recipient_id THEN RAISE EXCEPTION 'Cannot transfer to self'; END IF;

  SELECT * INTO _sender FROM public.user_credits WHERE user_id = _claim.sender_id FOR UPDATE;
  IF NOT FOUND OR (_sender.days_remaining - _claim.days) < 60 THEN
    RAISE EXCEPTION 'Sender must retain at least 60 days';
  END IF;
  INSERT INTO public.user_credits(user_id, days_remaining, expires_at)
  VALUES (_recipient_id, 0, now()) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO _recipient FROM public.user_credits WHERE user_id = _recipient_id FOR UPDATE;

  UPDATE public.user_credits
  SET days_remaining = days_remaining - _claim.days,
      expires_at = GREATEST(now(), expires_at - make_interval(days => _claim.days)),
      updated_at = now()
  WHERE user_id = _claim.sender_id RETURNING * INTO _sender;

  UPDATE public.user_credits
  SET days_remaining = days_remaining + _claim.days,
      expires_at = GREATEST(COALESCE(expires_at, now()), now()) + make_interval(days => _claim.days),
      updated_at = now()
  WHERE user_id = _recipient_id RETURNING * INTO _recipient;

  INSERT INTO public.credit_transactions(user_id, type, days, note)
  VALUES
    (_claim.sender_id, 'transfer_out', -_claim.days, 'โอนวันให้เพื่อน · ย้อนกลับไม่ได้'),
    (_recipient_id, 'transfer_in', _claim.days, 'รับวันจากเพื่อน');

  UPDATE public.day_transfer_claims
  SET status = 'claimed', recipient_id = _recipient_id, claimed_at = now()
  WHERE id = _claim.id;

  RETURN QUERY SELECT _sender.days_remaining, _recipient.days_remaining, _claim.days;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_day_transfer(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_day_transfer(uuid, uuid) TO service_role;