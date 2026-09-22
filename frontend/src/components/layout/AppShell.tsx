import type { PropsWithChildren } from "react";
import { Menu, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useTheme } from "@/context/ThemeProvider";
import { usePredictionStore } from "@/store/predictionStore";
import winningFormLogo from "@/assets/winning_form+_new_logo.png";
import winningFormLogoDark from "@/assets/winning_form+_new_logo.png";

export function AppShell({ children }: PropsWithChildren) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { toggleSidebar } = usePredictionStore();
  const navigate = useNavigate();

  return (
    <div
      className={[
        "app-shell flex flex-row h-screen w-screen overflow-hidden text-gray-900",
        isDark ? "bg-[#100130] dark:text-slate-100" : "bg-slate-50",
      ].join(" ")}
    >
      <Sidebar />

      <main
        className={[
          "relative flex-1 flex flex-col h-full min-w-0 overflow-hidden",
          isDark
            ? "bg-transparent text-gray-900 dark:bg-transparent dark:text-slate-100"
            : "bg-slate-50 text-gray-900",
        ].join(" ")}
      >
        {/* Mobile Top App Bar (Visible on screens < md) */}
        <header className="md:hidden flex h-14 w-full shrink-0 items-center justify-between px-3.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0E0F1A]/95 backdrop-blur-md z-30 select-none shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleSidebar}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors hover:bg-purple-100 dark:hover:bg-purple-950/60 active:scale-95 cursor-pointer"
              aria-label="Toggle navigation menu"
              title="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div
              onClick={() => navigate("/")}
              className="flex items-center cursor-pointer active:opacity-80"
              role="button"
              tabIndex={0}
            >
              <img
                src={winningFormLogo}
                alt="Winning Form+"
                className="h-8 w-auto object-contain dark:hidden"
              />
              <img
                src={winningFormLogoDark}
                alt="Winning Form+"
                className="h-8 w-auto object-contain hidden dark:block"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors active:scale-95 cursor-pointer"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {isDark && (
          <div className="app-dark-background" aria-hidden="true">
            <div className="app-dark-background__glow" />
            <div className="app-dark-background__lines app-dark-background__lines--left" />
            <div className="app-dark-background__lines app-dark-background__lines--right" />
            <div className="app-dark-background__dots app-dark-background__dots--one" />
            <div className="app-dark-background__dots app-dark-background__dots--two" />
            <div className="app-dark-background__particles" />
          </div>
        )}

        <div className="relative z-10 w-full h-full min-h-0 flex-1 overflow-y-auto no-scrollbar bg-transparent">
          {children}
        </div>
      </main>
    </div>
  );
}