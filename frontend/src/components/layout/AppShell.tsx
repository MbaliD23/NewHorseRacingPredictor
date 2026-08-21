import type { PropsWithChildren } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0B0C14] text-gray-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden min-w-0 relative bg-white dark:bg-[#0B0C14] text-gray-900 dark:text-slate-100 transition-colors duration-300">
        <div className="relative z-10 w-full h-full min-h-0 overflow-y-auto no-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}


