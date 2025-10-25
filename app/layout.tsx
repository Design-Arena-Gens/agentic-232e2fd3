import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { cookies } from "next/headers";
import type { Session } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server-client";
import { SupabaseProvider } from "@/components/providers/supabase-provider";

export const metadata: Metadata = {
  title: "Notion Clone",
  description: "Collaborative document workspace powered by Supabase."
};

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  let session: Session | null = null;

  if (supabase) {
    const {
      data: { session: serverSession }
    } = await supabase.auth.getSession();
    session = serverSession;
  }

  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <SupabaseProvider initialSession={session}>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
