"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet } from "@/components/ledger/sheet";
import type { ActionState } from "@/lib/actions/types";

type AuthResult = ActionState<{ needsVerification: boolean }>;
type AuthAction = (prev: AuthResult, formData: FormData) => Promise<AuthResult>;

const initial: AuthResult = { ok: false, error: "" };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-destructive mt-1 text-xs">{errors[0]}</p>;
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="py-2">{children}</div>;
}

export function AuthForm({ mode, action }: { mode: "login" | "register"; action: AuthAction }) {
  const [state, formAction, pending] = useActionState(action, initial);
  const isRegister = mode === "register";

  if (state.ok && state.data.needsVerification) {
    return (
      <Sheet className="px-7 py-6">
        <span className="folio">Form A-2 · pending</span>
        <h1 className="mt-2 text-2xl">Check your inbox</h1>
        <p className="text-ink-2 mt-2 leading-relaxed">
          A verification link is on its way to your email. Open it to activate the account, then log
          in.
        </p>
      </Sheet>
    );
  }

  return (
    <Sheet className="px-7 py-6">
      <div className="flex items-baseline justify-between">
        <span className="folio">
          {isRegister ? "Form A-1 · new account" : "Form A-3 · sign in"}
        </span>
      </div>
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
          {isRegister && (
            <Field>
              <Label htmlFor="name" className="folio">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                required
                className="border-foreground/25 focus-visible:border-rule mt-0.5 h-9 rounded-none border-0 border-b-2 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
              <FieldError errors={!state.ok ? state.fieldErrors?.name : undefined} />
            </Field>
          )}

          <Field>
            <Label htmlFor="email" className="folio">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="border-foreground/25 focus-visible:border-rule mt-0.5 h-9 rounded-none border-0 border-b-2 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <FieldError errors={!state.ok ? state.fieldErrors?.email : undefined} />
          </Field>

          <Field>
            <Label htmlFor="password" className="folio">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              className="border-foreground/25 focus-visible:border-rule mt-0.5 h-9 rounded-none border-0 border-b-2 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <FieldError errors={!state.ok ? state.fieldErrors?.password : undefined} />
          </Field>
        </div>

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
