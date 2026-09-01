import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { PhaseStub } from "@/components/app/phase-stub";

export const metadata: Metadata = { title: "Budget" };

export default function BudgetPage() {
  return (
    <div>
      <PageHeader
        title="Budget"
        description="Split each month's income into envelopes, then log what you spend."
      />
      <PhaseStub phase="Phase 3">
        Wallets &amp; transfers, monthly allocations, transactions, the envelope dashboard, auto
        rollover, recurring items, trends and savings goals land here.
      </PhaseStub>
    </div>
  );
}
