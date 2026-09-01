import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { consumeToken } from "@/lib/tokens";
import { Sheet } from "@/components/ledger/sheet";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Confirm your email" };
export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  let ok = false;
  if (token && email) {
    ok = await consumeToken("verify", email, token);
    if (ok) {
      try {
        await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });
      } catch {
        ok = false;
      }
    }
  }

  return (
    <Sheet className="px-7 py-6">
      <span className="folio">Form A-2 · {ok ? "confirmed" : "not confirmed"}</span>
      <h1 className="mt-2 text-2xl">{ok ? "Your email is confirmed" : "That link didn't work"}</h1>
      <p className="text-ink-2 mt-2 leading-relaxed">
        {ok
          ? "Your account is open. Log in to start your book."
          : "The link may have expired or already been used. Request a fresh one from the login page."}
      </p>
      <Link href="/login" className={cn(buttonVariants(), "mt-5")}>
        Go to log in
      </Link>
    </Sheet>
  );
}
