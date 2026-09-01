import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { registerAction } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  return <AuthForm mode="register" action={registerAction} />;
}
