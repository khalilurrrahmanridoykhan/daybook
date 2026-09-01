import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** A ruled <select> line, matching the auth forms' RuledField. */
export function SelectLine({
  label,
  name,
  className,
  children,
  ...props
}: React.ComponentProps<"select"> & { label: string; name: string }) {
  return (
    <div className="py-2">
      <Label htmlFor={name} className="folio">
        {label}
      </Label>
      <select
        id={name}
        name={name}
        className={cn(
          "border-foreground/25 focus-visible:border-rule mt-0.5 h-9 w-full border-0 border-b-2 bg-transparent pr-6 pl-0 text-base focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
