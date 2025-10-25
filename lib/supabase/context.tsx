"use client";

import { createContext, useContext } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

type SupabaseContextValue = {
  supabase: SupabaseClient | null;
  initialSession: Session | null;
};

export const SupabaseContext = createContext<SupabaseContextValue>({
  supabase:
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
      : null,
  initialSession: null
});

export function useSupabase() {
  return useContext(SupabaseContext);
}
