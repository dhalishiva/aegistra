// Public Supabase connection settings, shared by the browser, server and middleware clients.
// Both values are public by design (the publishable key is protected by Row Level Security).
// The fallbacks keep Preview deployments working when the NEXT_PUBLIC_* variables are only
// defined for Production; remove them once the variables exist for every Vercel environment.
export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://aeyaivjyoponbddxflvd.supabase.co";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_xC5ERQ6F9gvsqiGzTk1uZg_JC_Hjp0m";
