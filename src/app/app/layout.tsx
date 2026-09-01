import Link from "next/link";
import { requireUser } from "@/lib/session";
import { AppNav } from "@/components/app/app-nav";
import { UserMenu } from "@/components/app/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/ledger/wordmark";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: user.timezone,
  }).format(new Date());

  return (
    <div className="flex min-h-full flex-col">
      <header className="bg-background/85 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-5 md:px-8">
          <div className="flex items-baseline gap-4">
            <Link href="/app" aria-label="Daybook — Today">
              <Wordmark />
            </Link>
            <span className="folio hidden sm:inline">{today}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <UserMenu name={user.name} email={user.email} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-5 py-8 md:grid-cols-[12rem_1fr] md:px-8">
        <aside className="md:sticky md:top-20 md:self-start">
          <AppNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
