import { cn } from "@/lib/utils";

/**
 * The Daybook wordmark — Fraunces with a hand-ruled red underline under the
 * name. Render inside a link or heading as needed.
 */
export function Wordmark({
  className,
  as: Tag = "span",
}: {
  className?: string;
  as?: "span" | "h1";
}) {
  return (
    <Tag
      className={cn("wordmark inline-flex items-baseline text-[1.35rem] leading-none", className)}
    >
      <span>Daybook</span>
    </Tag>
  );
}
