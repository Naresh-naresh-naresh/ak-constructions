import "server-only";
import { getSupabase } from "@/lib/supabase";
import { normalizePhone } from "@/lib/utils";
import type {
  CreateQuoteInput,
  QuoteRecord,
  QuoteStatus,
} from "@/types/quote";

/**
 * Quote/lead persistence.
 *
 * Error convention matches src/lib/projects.ts: supabase-js returns
 * { data, error } instead of throwing, so every call checks `error` and throws.
 * That matters especially here — silently swallowing a write error would mean
 * telling a prospective customer "we've got your request" while losing the lead.
 */

const QUOTES_TABLE = "quotes";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createQuote(input: CreateQuoteInput): Promise<void> {
  const { error } = await getSupabase()
    .from(QUOTES_TABLE)
    .insert({
      name: input.name.trim(),
      phone: normalizePhone(input.phone),
      email: input.email?.trim() || null,
      city: input.city?.trim() || null,
      bhk: input.bhk || null,
      sqFt: input.sqFt,
      workType: input.workType || null,
      timeline: input.timeline || null,
      estimate: input.estimate,
    });

  if (error) throw new Error(`createQuote failed: ${error.message}`);
}

export async function listQuotes(): Promise<QuoteRecord[]> {
  const { data, error } = await getSupabase()
    .from(QUOTES_TABLE)
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) throw new Error(`listQuotes failed: ${error.message}`);
  return (data ?? []) as QuoteRecord[];
}

export async function updateQuote(
  id: string,
  patch: { status?: QuoteStatus; notes?: string }
): Promise<QuoteRecord | null> {
  if (!UUID_RE.test(id)) return null;

  const changes: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };
  if (patch.status !== undefined) changes.status = patch.status;
  if (patch.notes !== undefined) changes.notes = patch.notes;

  const { data, error } = await getSupabase()
    .from(QUOTES_TABLE)
    .update(changes)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(`updateQuote failed: ${error.message}`);
  return (data as QuoteRecord | null) ?? null;
}
