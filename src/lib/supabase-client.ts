"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./supabase-env";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
