import type { Metadata } from "next";
import Link from "next/link";
import { Sheet } from "@/components/ledger/sheet";
import { RuledField } from "@/components/auth/ruled-field";
import { MiniForm } from "@/components/auth/mini-form";
import { resetPasswordAction } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetTokenPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { token } = await params;
  const { email } = await searchParams;

  return (
    <Sheet className="px-7 py-6">
      <span className="folio">Form A-4 · new password</span>
      <h1 className="mt-2 text-[1.8rem] leading-tight">Set a new password</h1>
      <p className="text-ink-2 mt-1.5 text-[0.98rem]">
        Choose something at least 8 characters long.
      </p>

      <div className="mt-4 border-t pt-2">
        <MiniForm
          action={resetPasswordAction}
          submit="Save the new password"
          done={
            <div>
              <p className="folio">Done. Your other sessions have been signed out.</p>
              <Link
                href="/login"
                className="text-primary mt-3 inline-block text-sm underline underline-offset-4"
              >
                Log in with your new password
              </Link>
            </div>
          }
        >
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email ?? ""} />
          <RuledField
            label="New password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
          />
        </MiniForm>
      </div>
    </Sheet>
  );
}
