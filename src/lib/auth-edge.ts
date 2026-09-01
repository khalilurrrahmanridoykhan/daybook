import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Edge-safe NextAuth instance for the proxy (middleware). No adapter, no
 * providers with Node-only code — only the shared `authConfig`.
 */
export const { auth } = NextAuth(authConfig);
