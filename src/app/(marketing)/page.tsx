import Link from "next/link";
import { CalendarClock, CheckSquare, NotebookPen, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const features = [
  {
    icon: CheckSquare,
    title: "Tasks",
    body: "Capture to-dos with due dates, priorities and tags. See Today, Upcoming, or a board.",
  },
  {
    icon: NotebookPen,
    title: "Notes",
    body: "A fast scratchpad — markdown, pin-to-top, full-text search, link a note to a task.",
  },
  {
    icon: CalendarClock,
    title: "Calendar alerts",
    body: "Connect Google once; dated tasks become calendar events and Google delivers the reminder.",
  },
  {
    icon: Wallet,
    title: "Envelope budget",
    body: "Split each month's income into envelopes, log spending, and watch the balance fall.",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <section className="py-20 sm:py-28">
        <p className="text-primary font-mono text-xs tracking-[0.16em] uppercase">
          Tasks · Notes · Calendar · Money
        </p>
        <h1 className="font-heading mt-4 text-4xl leading-[1.05] sm:text-6xl">
          Your day and your money, in one book.
        </h1>
        <p className="text-muted-foreground mt-5 max-w-xl text-lg">
          Daybook keeps your tasks, quick notes, calendar reminders, and month-by-month envelope
          budgeting together — one private workspace, one login.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Create your account
          </Link>
          <Link href="/login" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Log in
          </Link>
        </div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="bg-card rounded-lg border p-5">
            <f.icon className="text-primary h-5 w-5" />
            <h2 className="mt-3 text-base font-semibold">{f.title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
