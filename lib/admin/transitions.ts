import type { Database } from "@/lib/supabase/database.types";

export type LeadStatus = Database["public"]["Enums"]["lead_status"];
export type LeadKind = Database["public"]["Enums"]["lead_kind"];

export type AdminFormState = {
  ok: boolean;
  code: "saved" | "invalid" | "not_admin" | "not_found" | "server_error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Legal status moves only. This allow list is the single source for both
 * the UI quick actions and the server action guard.
 */
export const leadTransitions: Record<LeadStatus, readonly LeadStatus[]> = {
  new: ["contacted", "scheduled", "lost", "spam"],
  contacted: ["scheduled", "completed", "lost", "spam"],
  scheduled: ["completed", "lost", "spam"],
  completed: [],
  lost: ["new", "contacted"],
  spam: [],
};
