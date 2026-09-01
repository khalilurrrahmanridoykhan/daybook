import Link from "next/link";
import { HeroLedger } from "@/components/marketing/hero-ledger";
import { Figure } from "@/components/ledger/figure";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const books = [
  {
    numeral: "I",
    title: "The task book",
    body: "Enter what must be done, with a date and a priority. Dated entries are posted to your calendar so the reminder finds you.",
  },
  {
    numeral: "II",
    title: "The note book",
    body: "A fast hand for ideas, links and the gist of a call. Pin what matters, search the rest, and attach a note to any task.",
  },
  {
    numeral: "III",
    title: "The calendar",
    body: "Connect Google once. Daybook writes each dated task into your calendar with its reminder — your phone does the nagging.",
  },
  {
    numeral: "IV",
    title: "The cash book",
    body: "Rule the month's income into envelopes — savings, transport, family food. Log each expense against one, and carry the balance forward.",
  },
];

const principles = [
  {
    head: "Kept privately",
    body: "One book per person. No shared ledgers, no feeds, no advertising against your spending.",
  },
  {
    head: "Honest arithmetic",
    body: "Every figure is stored to the poisha as a whole number. No rounding drift, no floating-point surprises.",
  },
  {
    head: "Carried forward",
    body: "Close a month and the unspent balance of each envelope moves into the next — richer, or in the red.",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
      {/* ── Hero ── */}
      <section className="grid items-center gap-10 py-12 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:py-16">
        <div>
          <p className="folio">A book of account for ordinary life</p>
          <h1 className="mt-5 text-[2.7rem] leading-[1.02] sm:text-6xl">
            Keep the books
            <br />
            on your life.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-balance">
            Daybook is a bookkeeper’s daybook for everything that isn’t a spreadsheet. Enter the
            day’s tasks, notes and spending in one place — and it posts them to your calendar and
            your monthly envelope budget.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              Open an account
            </Link>
            <Link href="#cash-book" className={buttonVariants({ size: "lg", variant: "outline" })}>
              See how a month is kept
            </Link>
          </div>
          <p className="folio mt-6">Free · your data stays yours · export any time</p>
        </div>

        <div className="flex justify-center md:justify-end">
          <HeroLedger />
        </div>
      </section>

      {/* ── The four books ── */}
      <section className="border-t py-12 md:py-16">
        <div className="grid gap-2 md:grid-cols-[14rem_1fr] md:gap-12">
          <div className="md:sticky md:top-24 md:self-start">
            <p className="folio">Contents</p>
            <h2 className="mt-3 text-3xl">Four books, one binding.</h2>
            <p className="text-ink-2 mt-3 max-w-xs text-[0.98rem] leading-relaxed">
              Each does one job well. They share a cover, an account and a search.
            </p>
            <p className="text-ink-3 mt-4 max-w-xs text-sm italic">
              Turn to any of them from the spine; the totals always agree.
            </p>
          </div>
          <ol className="mt-4 md:mt-0">
            {books.map((b) => (
              <li
                key={b.numeral}
                className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t py-6 first:border-t-0 first:pt-0 md:first:border-t"
              >
                <span className="text-rule pt-0.5 font-[family-name:var(--font-display)] text-xl">
                  {b.numeral}
                </span>
                <div>
                  <h3 className="text-xl">{b.title}</h3>
                  <p className="text-ink-2 mt-1.5 max-w-prose leading-relaxed">{b.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── How the cash book is kept ── */}
      <section id="cash-book" className="scroll-mt-20 border-t py-12 md:py-16">
        <p className="folio">The cash book, worked</p>
        <h2 className="mt-3 max-w-2xl text-3xl">
          Say your salary is <Figure value={4_000_000n} showCurrency className="text-[0.9em]" /> a
          month.
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              head: "Post the income",
              body: "Enter what came in, and into which wallet — cash, bank, or a mobile account like bKash.",
            },
            {
              step: "2",
              head: "Rule off the envelopes",
              body: "Split it by amount or percentage until nothing is left unassigned: 20,000 to savings, 5,000 to transport, and so on.",
            },
            {
              step: "3",
              head: "Enter as you spend",
              body: "Each expense is charged to an envelope. The balance falls in black, then turns to red (parentheses) when it's overspent.",
            },
          ].map((s) => (
            <div key={s.step} className="border-t pt-4">
              <span className="folio">Step {s.step}</span>
              <h3 className="mt-2 text-lg">{s.head}</h3>
              <p className="text-ink-2 mt-1.5 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="text-ink-2 mt-8 max-w-2xl leading-relaxed">
          At month’s end Daybook rules a line, writes the closing figures, and carries each
          envelope’s balance into the next month. Recurring income and fixed bills are entered for
          you.
        </p>
      </section>

      {/* ── Principles ── */}
      <section className="border-t py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {principles.map((p) => (
            <div key={p.head}>
              <h3 className="text-rule font-[family-name:var(--font-display)] text-lg">{p.head}</h3>
              <p className="text-ink-2 mt-2 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Close ── */}
      <section className="border-t py-14 text-center md:py-20">
        <h2 className="text-4xl">Start your book.</h2>
        <p className="text-ink-2 mx-auto mt-3 max-w-sm leading-relaxed">
          It opens on a blank page. The first entry takes about a minute.
        </p>
        <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "mt-7")}>
          Open an account
        </Link>
      </section>
    </div>
  );
}
