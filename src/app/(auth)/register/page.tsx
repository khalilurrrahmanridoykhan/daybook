import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { registerAction } from "@/lib/actions/auth";
import { featureFlags } from "@/lib/env";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  if (!featureFlags.registration) redirect("/login");
  return <AuthForm mode="register" action={registerAction} />;
}
