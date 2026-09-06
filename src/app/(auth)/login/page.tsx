import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "@/lib/actions/auth";
import { featureFlags } from "@/lib/env";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return <AuthForm mode="login" action={loginAction} allowRegistration={featureFlags.registration} />;
}
