import { cn } from "@/lib/utils";

/**
 * A sheet from the book — raised bond paper with a hairline border and,
 * optionally, the red margin rule of a real ledger page.
 */
export function Sheet({
  className,
  ruled = false,
  children,
  ...props
}: React.ComponentProps<"div"> & { ruled?: boolean }) {
  return (
    <div className={cn("sheet", ruled && "sheet--ruled", className)} {...props}>
      {children}
    </div>
  );
}

/** A page header inside a sheet — folio mark on the left, optional note on the right. */
export function SheetHead({
  folio,
  title,
  aside,
  className,
}: {
  folio?: string;
  title?: string;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 border-b pb-3", className)}>
      <div className="flex items-baseline gap-3">
        {folio ? <span className="folio">{folio}</span> : null}
        {title ? <h2 className="text-lg leading-none">{title}</h2> : null}
      </div>
      {aside ? <div className="folio">{aside}</div> : null}
    </div>
  );
}
