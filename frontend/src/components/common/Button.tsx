import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gold" | "ghost" | "outline" | "cyan";
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

import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePredictionStore } from "@/store/predictionStore";

export interface PredictorButtonProps {
  raceId?: number | string | null;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  label?: string;
}

export function PredictorButton({
  raceId,
  className,
  disabled = false,
  onClick,
  label = "✦ Go to Prediction",
}: PredictorButtonProps) {
  const navigate = useNavigate();
  const { currentRace } = usePredictionStore();
  const targetRaceId = raceId ?? currentRace?.id;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
      return;
    }
    if (targetRaceId) {
      navigate(`/analysis/${targetRaceId}`);
    }
  };

  const isDisabled = disabled || !targetRaceId;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm md:text-base font-bold text-white transition-all duration-300",
        "bg-gradient-to-r from-[#6A2DF1] via-[#7C3AED] to-[#4F46E5]",
        "shadow-[0_4px_20px_rgba(106,45,241,0.35)] hover:shadow-[0_6px_28px_rgba(106,45,241,0.55)]",
        "hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none",
        className
      )}
      aria-label="Go to Prediction"
    >
      <span className="tracking-wide">{label}</span>
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </button>
  );
}
