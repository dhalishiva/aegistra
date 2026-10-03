"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://aeyaivjyoponbddxflvd.supabase.co";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_xC5ERQ6F9gvsqiGzTk1uZg_JC_Hjp0m";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
