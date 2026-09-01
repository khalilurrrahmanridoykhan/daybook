import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { PhaseStub } from "@/components/app/phase-stub";

export const metadata: Metadata = { title: "Budget" };

export default function BudgetPage() {
  return (
    <div>
      <PageHeader
        folio="The cash book"
        title="Budget"
        description="Rule the month's income into envelopes, then charge each expense to one."
      />
      <PhaseStub phase="Phase 3">
        Wallets &amp; transfers, monthly allocations, transactions, the envelope dashboard, auto
        rollover, recurring items, trends and savings goals land here.
      </PhaseStub>
    </div>
  );
}
