import Link from "next/link";
import { Wordmark } from "@/components/ledger/wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto flex h-16 w-full max-w-md items-center px-5">
        <Link href="/" aria-label="Daybook — home">
          <Wordmark />
        </Link>
      </div>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-20">
        {children}
      </main>
    </div>
  );
}
