import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.97] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[var(--shadow-primary)] hover:brightness-110 hover:-translate-y-px",
        secondary:
          "bg-secondary text-secondary-foreground hover:brightness-110 hover:-translate-y-px",
        outline:
          "border border-border-strong bg-surface hover:bg-foreground/[0.04] hover:border-foreground/20",
        ghost: "hover:bg-foreground/[0.06]",
        danger: "bg-danger text-white hover:brightness-110 hover:-translate-y-px",
      },
      size: {
        sm: "h-9 px-3.5",
        md: "h-11 px-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends
    React.ComponentPropsWithRef<"button">,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
