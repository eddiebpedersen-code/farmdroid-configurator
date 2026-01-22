import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database-types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client for browser/client-side use
 * Uses the anon/publishable key (safe for client-side)
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
