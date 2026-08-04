import type { Json } from "@/integrations/supabase/types";

export type ShareKind = "natal" | "compatibility" | "daily";
export type CardKind = "yes_no" | "lucky_number";

export type PublicShare = {
  type: ShareKind;
  title: string;
  payload: Json;
  expiresAt: string;
};

export type DayTransferPreview = {
  id: string;
  days: number;
  senderName: string;
  expiresAt: string;
  available: boolean;
};

export type CardDraw = {
  kind: CardKind;
  result: Json;
  ruleCode: string;
  confidence: number;
  citations: Array<{ title: string; locator: string }>;
  limitations: string[];
  drawnAt: string;
};