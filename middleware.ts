import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PATHS = ["/login"];

export async function middleware(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const responseCookies: { name: string; value: string; options?: Record<string, unknown> }[] = [];
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            responseCookies.push({ name, value, options });
            res.cookies.set({ name, value, ...options });
          });
        }
      }
    }
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const forwardCookies = (response: NextResponse) => {
    responseCookies.forEach(({ name, value, options }) => {
      response.cookies.set({ name, value, ...options });
    });
    return response;
  };

  const isAuthRoute = AUTH_PATHS.some((path) => req.nextUrl.pathname.startsWith(path));
  if (!session && !isAuthRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return forwardCookies(NextResponse.redirect(redirectUrl));
  }

  if (session && isAuthRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    return forwardCookies(NextResponse.redirect(redirectUrl));
  }

  return forwardCookies(res);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json).*)"]
};
