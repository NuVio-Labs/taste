import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-neutral-200 bg-white shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
