import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { WalletData } from "@/lib/wallet";
import { MockCheckoutInput } from "@/lib/wallet.schemas";

export const getMyWallet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WalletData> => {
    const [credits, points, code, transactions, packages] = await Promise.all([
      context.supabase
        .from("user_credits")
        .select("days_remaining, expires_at")
        .eq("user_id", context.userId)
        .maybeSingle(),
      context.supabase.from("user_points").select("balance").eq("user_id", context.userId).maybeSingle(),
      context.supabase.from("referral_codes").select("code").eq("user_id", context.userId).maybeSingle(),
      context.supabase
        .from("credit_transactions")
        .select("id, type, days, points_used, note, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(50),
      context.supabase
        .from("packages")
        .select("code, name_th, days, price_thb, bonus_days, is_popular, sort_order")
        .order("sort_order"),
    ]);
    const error = credits.error ?? points.error ?? code.error ?? transactions.error ?? packages.error;
    if (error) throw new Error(error.message);
    return {
      daysRemaining: credits.data?.days_remaining ?? 0,
      expiresAt: credits.data?.expires_at ?? null,
      points: points.data?.balance ?? 0,
      referralCode: code.data?.code ?? null,
      transactions: transactions.data ?? [],
      packages: packages.data ?? [],
    };
  });

export const completeMockCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MockCheckoutInput.parse(input))
  .handler(async ({ data, context }) => {
    const { assertMockCheckoutAllowed } = await import("@/lib/mock-checkout.server");
    assertMockCheckoutAllowed();

    // The authenticated middleware is the sole source of ownership. Package
    // days and price are loaded by the database RPC from the package code;
    // client-supplied user IDs, prices, days, or payable amounts are rejected.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("complete_mock_day_purchase", {
      _user_id: context.userId,
      _package_code: data.packageCode,
      _points_to_use: data.pointsToUse,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(result) ? result[0] : result;
    if (!row) throw new Error("ยืนยันการเติมวันไม่สำเร็จ");
    return row;
  });

export const adjustUserDays = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      userId: z.string().uuid(),
      days: z.number().int().refine((value) => value !== 0),
      note: z.string().max(240).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: role, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleError || !role) throw new Error("ไม่มีสิทธิ์ปรับวันใช้งาน");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.days > 0) {
      const { data: result, error } = await supabaseAdmin.rpc("grant_user_days", {
        _user_id: data.userId,
        _days: data.days,
        _type: "admin",
        _points_used: 0,
        _note: data.note ?? "ปรับยอดโดยผู้ดูแล",
      });
      if (error) throw new Error(error.message);
      return result;
    }
    const { data: result, error } = await supabaseAdmin.rpc("deduct_user_days", {
      _user_id: data.userId,
      _days: Math.abs(data.days),
      _type: "admin",
      _note: data.note ?? "ปรับยอดโดยผู้ดูแล",
    });
    if (error) throw new Error(error.message);
    return result;
  });