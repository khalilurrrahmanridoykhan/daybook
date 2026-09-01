import { Figure } from "@/components/ledger/figure";
import { Sheet } from "@/components/ledger/sheet";

type Row = { name: string; spent: bigint | null; left: bigint; delay: number };

const rows: Row[] = [
  { name: "Savings", spent: null, left: 2_000_000n, delay: 0.12 },
  { name: "Transport & food out", spent: 430_000n, left: 70_000n, delay: 0.19 },
  { name: "Family food", spent: 1_085_000n, left: -85_000n, delay: 0.26 },
  { name: "Wife's allowance", spent: 500_000n, left: 0n, delay: 0.33 },
];

const Dash = () => <span className="text-ink-3">—</span>;

export function HeroLedger() {
  return (
    <Sheet ruled className="hero-ledger w-full max-w-md py-6 pr-6 sm:pr-7">
      <div className="flex items-baseline justify-between border-b pb-3">
        <span className="folio">Fol. 09</span>
        <span className="folio">September 2026</span>
      </div>

      <table className="mt-3.5 w-full text-[0.9rem]">
        <tbody>
          <tr className="hero-ledger__line">
            <td className="py-1.5 pr-3 italic">Salary, brought in</td>
            <td />
            <td className="figure py-1.5 text-right">
              <Figure value={4_000_000n} />
            </td>
          </tr>

          <tr className="folio border-t">
            <th scope="col" className="py-2 text-left font-normal">
              Envelope
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-normal">
              Spent
            </th>
            <th scope="col" className="py-2 text-right font-normal">
              Left
            </th>
          </tr>

          {rows.map((r) => (
            <tr
              key={r.name}
              className="hero-ledger__line border-t border-dotted"
              style={{ animationDelay: `${r.delay}s` }}
            >
              <td className="py-1.5 pr-3">{r.name}</td>
              <td className="py-1.5 pr-4 text-right">
                {r.spent === null ? <Dash /> : <Figure value={r.spent} />}
              </td>
              <td className="py-1.5 text-right">
                {r.left === 0n ? <Dash /> : <Figure value={r.left} />}
              </td>
            </tr>
          ))}

          <tr className="hero-ledger__line" style={{ animationDelay: "0.42s" }}>
            <td className="rule-tt py-2 pt-2.5 pr-3 font-medium">In hand</td>
            <td className="rule-tt" />
            <td className="rule-tt py-2 pt-2.5 text-right font-medium">
              <Figure value={1_985_000n} />
            </td>
          </tr>
        </tbody>
      </table>

      <p className="text-ink-3 mt-3.5 border-t border-dotted pt-2.5 text-xs">
        Family food over by <Figure value={-85_000n} className="text-xs" /> — carried to October.
      </p>
    </Sheet>
  );
}
