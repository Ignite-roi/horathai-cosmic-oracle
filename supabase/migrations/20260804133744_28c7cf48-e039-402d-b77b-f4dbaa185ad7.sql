-- P0.1 Mock Lockdown: additive/revocation-only hardening.
-- Rollback is documented in the application runbook; do not restore client DML
-- grants unless matching write RLS policies are intentionally introduced.

REVOKE ALL ON FUNCTION public.complete_mock_day_purchase(uuid, text, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_user_days(uuid, integer, public.credit_transaction_type, integer, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.deduct_user_days(uuid, integer, public.credit_transaction_type, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.complete_mock_day_purchase(uuid, text, integer)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_user_days(uuid, integer, public.credit_transaction_type, integer, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_user_days(uuid, integer, public.credit_transaction_type, text)
  TO service_role;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.user_credits,
     public.user_points,
     public.credit_transactions,
     public.packages,
     public.referral_codes,
     public.referrals
  FROM anon, authenticated;

-- Preserve only the reads already constrained by the existing RLS policies.
GRANT SELECT ON public.user_credits,
                public.user_points,
                public.credit_transactions,
                public.referral_codes,
                public.referrals
  TO authenticated;
GRANT SELECT ON public.packages TO anon, authenticated;

GRANT ALL ON public.user_credits,
             public.user_points,
             public.credit_transactions,
             public.packages,
             public.referral_codes,
             public.referrals
  TO service_role;