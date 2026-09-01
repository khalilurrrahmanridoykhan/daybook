import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return <AuthForm mode="login" action={loginAction} />;
}
