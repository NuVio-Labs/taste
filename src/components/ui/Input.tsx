import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-neutral-200/80 bg-[#f8f8fc] px-4 py-3.5 text-sm font-medium tracking-[-0.01em] text-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition focus:border-[#b8a8ff] focus:bg-white focus:ring-4 focus:ring-[#ede9ff] placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-100",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
