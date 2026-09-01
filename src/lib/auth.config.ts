import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config: no database or Node-only imports here. Shared by the
 * proxy (middleware) and the full config in `auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtected = nextUrl.pathname.startsWith("/app");
      const isAuthPage = ["/login", "/register", "/reset", "/verify"].some((p) =>
        nextUrl.pathname.startsWith(p),
      );

      if (isProtected) return isLoggedIn;
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/app", nextUrl));
      }
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = String(user.id);
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 0;
      }
      if (trigger === "update") {
        const next = (session as { sessionVersion?: number } | null | undefined)?.sessionVersion;
        if (typeof next === "number") token.sessionVersion = next;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
      }
      session.sessionVersion = typeof token.sessionVersion === "number" ? token.sessionVersion : 0;
      return session;
    },
  },
} satisfies NextAuthConfig;
