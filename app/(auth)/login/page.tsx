"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useRef, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { signInWithEmail, signUpWithEmail } from "./actions";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const params = useSearchParams();

  const statusMessage =
    params.get("status") === "check-email"
      ? "Account created. Check your inbox to confirm your email address."
      : null;
  const redirectedFrom = params.get("redirectedFrom") || "/";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value.trim();
    const fullName = fullNameRef.current?.value.trim();

    if (!email || !password || (mode === "signup" && !fullName)) {
      setError("Please fill in all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("redirectTo", redirectedFrom);
    if (mode === "signup") {
      formData.append("fullName", fullName!);
    }

    setError(null);
    startTransition(async () => {
      try {
        if (mode === "signin") {
          await signInWithEmail(formData);
        } else {
          await signUpWithEmail(formData);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unexpected error, please try again.");
        }
      }
    });
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand">
          <span className="text-xl font-bold text-white">N</span>
        </div>
        <h1 className="text-2xl font-semibold">Sign in to your workspace</h1>
        <p className="mt-2 text-sm text-slate-400">
          {mode === "signin"
            ? "Access your documents and thoughts instantly."
            : "Create an account to start your collaborative workspace."}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Full name
            </label>
            <input
              ref={fullNameRef}
              id="fullName"
              name="fullName"
              placeholder="Ada Lovelace"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
            />
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="Enter a secure password"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
      {statusMessage && <p className="mt-4 text-sm text-emerald-400">{statusMessage}</p>}
      <p className="mt-6 text-center text-sm text-slate-400">
        {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="text-brand underline-offset-2 hover:underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          disabled={isPending}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
