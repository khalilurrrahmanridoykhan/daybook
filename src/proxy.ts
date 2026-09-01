import { auth } from "@/lib/auth-edge";

// Route protection is expressed in `authConfig.callbacks.authorized`.
// This is an optimistic check only — Server Components and Server Actions
// re-verify the session with the database.
export default auth((req) => {
  void req;
});

export const config = {
  matcher: [
    /*
     * Run on every path except:
     * - /api/*        (route handlers do their own auth)
     * - _next static / image assets
     * - files with an extension (favicon.ico, robots.txt, *.svg, …)
     */
    "/((?!api|_next/static|_next/image|.*\\.[\\w]+$).*)",
  ],
};
