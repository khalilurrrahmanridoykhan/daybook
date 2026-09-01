import Link from "next/link";
import { requireUser } from "@/lib/session";
import { AppNav } from "@/components/app/app-nav";
import { UserMenu } from "@/components/app/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-full flex-col">
      <header className="bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/app" className="font-heading text-lg font-medium">
            Daybook
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <UserMenu name={user.name} email={user.email} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 md:grid-cols-[13rem_1fr]">
        <aside className="md:sticky md:top-20 md:self-start">
          <AppNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
