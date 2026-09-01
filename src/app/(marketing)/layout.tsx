import Link from "next/link";
import { Wordmark } from "@/components/ledger/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
          <Link href="/" aria-label="Daybook — home">
            <Wordmark />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/login"
              className="folio hover:text-foreground hidden px-2 py-2 transition-colors sm:inline"
            >
              Log in
            </Link>
            <ThemeToggle />
            <Link href="/register" className={buttonVariants({ size: "sm" })}>
              Open an account
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t">
        <div className="text-ink-3 mx-auto grid w-full max-w-6xl gap-4 px-5 py-10 text-sm md:grid-cols-[1fr_auto] md:px-8">
          <p className="max-w-md font-[family-name:var(--font-text)] leading-relaxed italic">
            Daybook is kept as a private book of account. Set in Fraunces &amp; Spectral, ruled in
            red, and balanced every month.
          </p>
          <nav className="folio flex flex-wrap items-start gap-x-6 gap-y-2">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Open an account
            </Link>
            <a
              href="https://github.com/khalilurrrahmanridoykhan/daybook"
              className="hover:text-foreground"
            >
              Source
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
