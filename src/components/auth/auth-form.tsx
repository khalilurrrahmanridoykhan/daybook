"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/types";

type AuthResult = ActionState<{ needsVerification: boolean }>;
type AuthAction = (prev: AuthResult, formData: FormData) => Promise<AuthResult>;

const initial: AuthResult = { ok: false, error: "" };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-destructive text-xs">{errors[0]}</p>;
}

export function AuthForm({ mode, action }: { mode: "login" | "register"; action: AuthAction }) {
  const [state, formAction, pending] = useActionState(action, initial);
  const isRegister = mode === "register";

  if (state.ok && state.data.needsVerification) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <h1 className="font-heading text-xl">Check your inbox</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          We sent a verification link to your email. Click it to activate your account, then log in.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h1 className="font-heading text-2xl">
        {isRegister ? "Create your account" : "Welcome back"}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {isRegister ? "Start organising your day and your money." : "Log in to your Daybook."}
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        {isRegister && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" required />
            <FieldError errors={!state.ok ? state.fieldErrors?.name : undefined} />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
          <FieldError errors={!state.ok ? state.fieldErrors?.email : undefined} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
          />
          <FieldError errors={!state.ok ? state.fieldErrors?.password : undefined} />
        </div>

        {!state.ok && state.error ? (
          <p className="text-destructive text-sm" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Please wait…" : isRegister ? "Create account" : "Log in"}
        </Button>
      </form>

      <p className="text-muted-foreground mt-4 text-center text-sm">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New to Daybook?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
