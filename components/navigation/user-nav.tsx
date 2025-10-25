"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useSupabase } from "@/lib/supabase/context";

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
};

export function UserNav() {
  const { supabase } = useSupabase();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!supabase) {
        setProfile(null);
        return;
      }
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }
      setProfile({
        id: user.id,
        full_name: (user.user_metadata as { full_name?: string })?.full_name ?? null,
        email: user.email ?? ""
      });
    };

    loadProfile();
  }, [supabase]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium text-white">
          {profile?.full_name || (supabase ? "Anonymous" : "Configure Supabase")}
        </p>
        <p className="text-xs text-slate-400">
          {profile?.email || (supabase ? "" : "Add Supabase env vars")}
        </p>
      </div>
      <button
        onClick={signOut}
        className="flex items-center gap-1 rounded-md border border-slate-800 px-2 py-1 text-xs font-semibold text-slate-300 transition hover:border-brand hover:text-white"
        disabled={!supabase}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}
