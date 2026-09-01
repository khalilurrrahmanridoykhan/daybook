export function PageHeader({
  folio,
  title,
  description,
  children,
}: {
  folio?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b pb-4">
      <div>
        {folio ? <p className="folio mb-1.5">{folio}</p> : null}
        <h1 className="text-3xl leading-none">{title}</h1>
        {description ? (
          <p className="text-ink-2 mt-2 max-w-prose text-[0.98rem]">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}
