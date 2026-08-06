import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(32,12,68,0.86),rgba(14,5,30,0.94))] shadow-[0_18px_64px_rgba(3,0,15,0.48),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
