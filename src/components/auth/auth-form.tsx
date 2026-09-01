"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ledger/sheet";
import { RuledField } from "@/components/auth/ruled-field";
import { resendVerificationAction } from "@/lib/actions/auth";
import { MiniForm } from "@/components/auth/mini-form";
import type { ActionState } from "@/lib/actions/types";

type AuthResult = ActionState<{ needsVerification: boolean }>;
type AuthAction = (prev: AuthResult, formData: FormData) => Promise<AuthResult>;

const initial: AuthResult = { ok: false, error: "" };

export function AuthForm({ mode, action }: { mode: "login" | "register"; action: AuthAction }) {
  const [state, formAction, pending] = useActionState(action, initial);
  const isRegister = mode === "register";
  const fieldErrors = !state.ok ? state.fieldErrors : undefined;

  if (state.ok && state.data.needsVerification) {
    return (
      <Sheet className="px-7 py-6">
        <span className="folio">Form A-2 · pending</span>
        <h1 className="mt-2 text-2xl">Check your inbox</h1>
        <p className="text-ink-2 mt-2 mb-4 leading-relaxed">
          A verification link is on its way. Open it to activate the account, then log in.
        </p>
        <MiniForm
          action={resendVerificationAction}
          submit="Send it again"
          done={<p className="folio">Sent — check your inbox.</p>}
        >
          <RuledField label="Email" name="email" type="email" required autoComplete="email" />
        </MiniForm>
      </Sheet>
    );
  }

  return (
    <Sheet className="px-7 py-6">
      <span className="folio">{isRegister ? "Form A-1 · new account" : "Form A-3 · sign in"}</span>
      <h1 className="mt-2 text-[1.8rem] leading-tight">
        {isRegister ? "Open your book" : "Return to your book"}
      </h1>
      <p className="text-ink-2 mt-1.5 text-[0.98rem]">
        {isRegister
          ? "One account, kept privately. It takes about a minute."
          : "Enter your details to pick up where you left off."}
      </p>

      <form action={formAction} className="mt-4">
        <div className="space-y-1 border-t pt-2">
          {isRegister ? (
            <RuledField
              label="Name"
              name="name"
              autoComplete="name"
              required
              errors={fieldErrors?.name}
            />
          ) : null}
          <RuledField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            errors={fieldErrors?.email}
          />
          <RuledField
            label="Password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            errors={fieldErrors?.password}
          />
        </div>

        {!isRegister ? (
          <div className="mt-2 text-right">
            <Link href="/reset" className="folio hover:text-foreground">
              Forgot password?
            </Link>
          </div>
        ) : null}

        {!state.ok && state.error ? (
          <p className="text-destructive mt-4 text-sm" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="mt-5 w-full" disabled={pending}>
          {pending ? "Please wait…" : isRegister ? "Open the account" : "Log in"}
        </Button>
      </form>

      <p className="text-ink-2 mt-5 text-sm">
        {isRegister ? (
          <>
            Already keep a book?{" "}
            <Link href="/login" className="text-primary underline underline-offset-4">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/register" className="text-primary underline underline-offset-4">
              Open an account
            </Link>
          </>
        )}
      </p>
    </Sheet>
  );
}
