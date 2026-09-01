import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link href="/" className="font-heading text-lg font-medium">
            Daybook
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Log in
            </Link>
            <Link href="/register" className={buttonVariants({ size: "sm" })}>
              Get started
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="text-muted-foreground mx-auto w-full max-w-5xl px-4 py-6 text-sm">
          Daybook — tasks, notes, calendar alerts, and envelope budgeting in one place.
        </div>
      </footer>
    </div>
  );
}
