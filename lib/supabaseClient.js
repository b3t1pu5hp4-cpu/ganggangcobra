import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fails loudly in dev if env vars are missing — see README for setup.
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Copy .env.example to .env.local and fill in your Supabase project keys."
  );
}

export const supabase = createClient(url, anonKey, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export const SHOTS_BUCKET = "shots";
