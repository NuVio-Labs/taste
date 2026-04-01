import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#7c5cff] text-white shadow-[0_18px_40px_-22px_rgba(124,92,255,0.9)] hover:bg-[#6b4df2] focus-visible:outline-[#7c5cff] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none",
  secondary:
    "bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 focus-visible:outline-neutral-300 disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400",
  ghost:
    "bg-transparent text-neutral-700 hover:bg-neutral-100 focus-visible:outline-neutral-300 disabled:text-neutral-400",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold tracking-[-0.01em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
