# P0.1 Mock Checkout Lockdown

## Server-only environment contract

Mock checkout is disabled by default. It is enabled only when both runtime
variables are present on the server:

- `HORATHAI_MOCK_CHECKOUT_MODE`: exactly `development` or `review`
- `HORATHAI_MOCK_CHECKOUT_ALLOWED_HOSTS`: comma-separated exact hostnames

Do not use a `VITE_` variable. Production domains must never be placed in the
allowlist. The request host is checked again for every purchase after the
authenticated server middleware has validated the user.

## Trust boundary

- Ownership always comes from authenticated server context.
- The client can send only `packageCode` and `pointsToUse`.
- Package price, granted days, bonus days, and payable amount are loaded from
  the server-controlled package catalog.
- Direct execution of credit RPCs is revoked from `PUBLIC`, `anon`, and
  `authenticated`; only the backend service role can execute them.

## Rollback

1. Keep the database revocations in place; they correct the intended service
   boundary and are not required to be reversed to disable this feature.
2. To disable immediately, remove `HORATHAI_MOCK_CHECKOUT_MODE` or set it to
   `disabled`. This is fail-closed and requires no database change.
3. To roll back only the application code, revert the P0.1 code commit. Do not
   restore direct RPC access to browser roles.
4. If an exceptional database rollback is required, restore only the prior
   table grants from the recorded pre-migration ACL. Never grant EXECUTE on
   `complete_mock_day_purchase`, `grant_user_days`, or `deduct_user_days` to
   browser roles.