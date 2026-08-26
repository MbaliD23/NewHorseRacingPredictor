import type { PropsWithChildren } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell flex flex-row h-screen w-screen overflow-hidden bg-[#100130] text-gray-900 dark:bg-[#100130] dark:text-slate-100">
      <Sidebar />

      <main className="relative flex-1 h-full min-w-0 overflow-hidden bg-transparent text-gray-900 dark:bg-transparent dark:text-slate-100">
        <div className="app-dark-background" aria-hidden="true">
          <div className="app-dark-background__glow" />

          <div className="app-dark-background__lines app-dark-background__lines--left" />
          <div className="app-dark-background__lines app-dark-background__lines--right" />

          <div className="app-dark-background__dots app-dark-background__dots--one" />
          <div className="app-dark-background__dots app-dark-background__dots--two" />

          <div className="app-dark-background__particles" />
        </div>

        <div className="relative z-10 w-full h-full min-h-0 overflow-y-auto no-scrollbar bg-transparent">
          {children}
        </div>
      </main>
    </div>
  );
}