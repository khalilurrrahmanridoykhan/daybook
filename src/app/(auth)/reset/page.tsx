import type { Metadata } from "next";
import Link from "next/link";
import { Sheet } from "@/components/ledger/sheet";
import { RuledField } from "@/components/auth/ruled-field";
import { MiniForm } from "@/components/auth/mini-form";
import { requestPasswordResetAction } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Reset your password" };

export default function ResetRequestPage() {
  return (
    <Sheet className="px-7 py-6">
      <span className="folio">Form A-4 · reset</span>
      <h1 className="mt-2 text-[1.8rem] leading-tight">Reset your password</h1>
      <p className="text-ink-2 mt-1.5 text-[0.98rem]">
        Enter your email and we’ll send a link to set a new one.
      </p>

      <div className="mt-4 border-t pt-2">
        <MiniForm
          action={requestPasswordResetAction}
          submit="Send the link"
          done={
            <div>
              <p className="folio">If that address has an account, a link is on its way.</p>
              <Link
                href="/login"
                className="text-primary mt-3 inline-block text-sm underline underline-offset-4"
              >
                Back to log in
              </Link>
            </div>
          }
        >
          <RuledField label="Email" name="email" type="email" required autoComplete="email" />
        </MiniForm>
      </div>

      <p className="text-ink-2 mt-5 text-sm">
        Remembered it?{" "}
        <Link href="/login" className="text-primary underline underline-offset-4">
          Log in
        </Link>
      </p>
    </Sheet>
  );
}
