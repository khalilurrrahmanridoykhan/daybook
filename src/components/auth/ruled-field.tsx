import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** A single ruled writing line, the way a printed form is set. */
export function RuledField({
  label,
  name,
  errors,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; name: string; errors?: string[] }) {
  return (
    <div className="py-2">
      <Label htmlFor={name} className="folio">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        className={cn(
          "border-foreground/25 focus-visible:border-rule mt-0.5 h-9 rounded-none border-0 border-b-2 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 dark:bg-transparent",
          className,
        )}
        {...props}
      />
      {errors?.length ? <p className="text-destructive mt-1 text-xs">{errors[0]}</p> : null}
    </div>
  );
}
