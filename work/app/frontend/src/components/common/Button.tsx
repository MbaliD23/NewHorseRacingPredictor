import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gold" | "ghost" | "outline" | "cyan" | "purple";
  size?: "sm" | "md" | "lg" | "icon";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "gold", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.01em] transition duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary/70 focus:ring-offset-2 focus:ring-offset-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
          variant === "gold" &&
            "border border-primary/60 bg-primary text-primary-foreground shadow-[0_12px_34px_rgba(255,196,52,.28)] hover:-translate-y-0.5 hover:brightness-105",
          variant === "purple" &&
            "border border-violet-700 bg-violet-700 text-white shadow-[0_12px_30px_rgba(109,40,217,.28)] hover:-translate-y-0.5 hover:bg-violet-800",
          variant === "ghost" && "bg-transparent text-foreground hover:bg-white/8",
          variant === "outline" &&
            "border border-white/12 bg-white/[0.03] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:border-primary/55 hover:bg-white/[0.06] hover:text-primary",
          variant === "cyan" &&
            "border border-cyan-400/55 bg-cyan-500/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,.16)] hover:-translate-y-0.5 hover:bg-cyan-500/16",
          size === "sm" && "h-10 px-4 text-sm",
          size === "md" && "h-12 px-5 text-base",
          size === "lg" && "h-14 px-7 text-base md:h-16 md:px-8 md:text-lg",
          size === "icon" && "h-12 w-12 px-0",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
