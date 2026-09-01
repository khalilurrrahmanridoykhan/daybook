export function PhaseStub({ phase, children }: { phase: string; children: React.ReactNode }) {
  return (
    <div className="sheet sheet--ruled max-w-2xl py-6 pr-6">
      <p className="folio">Not yet posted · {phase}</p>
      <p className="text-ink-2 mt-2 leading-relaxed italic">{children}</p>
    </div>
  );
}
