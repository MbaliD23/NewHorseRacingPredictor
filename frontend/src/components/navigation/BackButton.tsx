import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface BackButtonProps {
  label?: string;
  className?: string;
  to?: string;
  fallbackTo?: string;
  theme?: "light" | "dark" | "glass" | "subtle";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function BackButton({
  label = "Go back",
  className,
  to,
  fallbackTo = "/",
  theme = "light",
  onClick,
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
      return;
    }

    const destination = to || fallbackTo || "/";
    navigate(destination);
  };

  const themeClasses: Record<string, string> = {
    light:
      "bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 shadow-xs",
    dark:
      "bg-[#1E293B]/90 hover:bg-purple-950/60 text-slate-300 hover:text-purple-300 border border-slate-700/70 hover:border-purple-500/50 shadow-xs",
    glass:
      "bg-white/80 backdrop-blur-md hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200/90 shadow-xs",
    subtle:
      "bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 border border-transparent shadow-none",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 aspect-square items-center justify-center rounded-full transition-all duration-200 active:scale-95 cursor-pointer",
        themeClasses[theme] ?? themeClasses.light,
        className
      )}
    >
      <ChevronLeft className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
    </button>
  );
}
