import { Hammer } from "lucide-react";

export function PhaseStub({ phase, children }: { phase: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg border border-dashed p-8 text-center">
      <Hammer className="text-muted-foreground mx-auto h-6 w-6" />
      <p className="text-primary mt-3 font-mono text-xs tracking-[0.14em] uppercase">{phase}</p>
      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">{children}</p>
    </div>
  );
}
