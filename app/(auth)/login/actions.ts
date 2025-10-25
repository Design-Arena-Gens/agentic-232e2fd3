"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server-client";

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const redirectTo = formData.get("redirectTo")?.toString() || "/";

  if (!email || !password) {
    throw new Error("Missing credentials");
  }

  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  if (!supabase) {
    throw new Error("Supabase credentials are not configured.");
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  redirect(redirectTo);
}

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("fullName")?.toString();

  if (!email || !password || !fullName) {
    throw new Error("Missing fields");
  }

  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  if (!supabase) {
    throw new Error("Supabase credentials are not configured.");
  }
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/login?status=check-email");
}
