import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Collect refreshed cookies to forward to both request and response.
  // Mutating request.cookies before calling intlMiddleware ensures server
  // components (Next.js cookies() API) see the refreshed token on the same
  // request cycle — fixes the bug where an expired access token was refreshed
  // by middleware but the server component still read the old token from the
  // original request, causing spurious redirects to /giris.
  const cookiesToForward: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mutate request so the next handler (server component) sees the
          // refreshed token via the cookies() helper.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToForward.push(...cookiesToSet);
        },
      },
    }
  );

  await supabase.auth.getUser();

  // Run intl middleware with the (potentially mutated) request so Next.js
  // carries the updated cookies into the server component.
  const intlResponse = intlMiddleware(request);

  // Also write refreshed cookies to the response so the browser stores them.
  cookiesToForward.forEach(({ name, value, options }) =>
    intlResponse.cookies.set(
      name,
      value,
      options as Parameters<typeof intlResponse.cookies.set>[2]
    )
  );

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|admin|_next|.*\\..*).*)", "/"],
};
