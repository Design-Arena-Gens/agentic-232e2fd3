"use client";

import { PropsWithChildren, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";
import { SupabaseContext } from "@/lib/supabase/context";

type SupabaseProviderProps = PropsWithChildren<{
  initialSession: Session | null;
}>;

export function SupabaseProvider({
  children,
  initialSession
}: SupabaseProviderProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = useMemo(
    () =>
      supabaseUrl && supabaseAnonKey
        ? createBrowserClient(supabaseUrl, supabaseAnonKey)
        : null,
    [supabaseUrl, supabaseAnonKey]
  );

  return (
    <SupabaseContext.Provider value={{ supabase, initialSession }}>
      {children}
    </SupabaseContext.Provider>
  );
}
