import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useStatus } from "@/hooks/useStatus";
import { formatDate, formatTime } from "@/lib/utils";

export function AppShell({ children }: PropsWithChildren) {
  const { data } = useStatus();
  const [liveClock, setLiveClock] = useState(() => new Date());
  const location = useLocation();
  const showHeaderLogo = location.pathname !== "/";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveClock(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-10 md:py-6">
        <div className="flex min-w-[120px] items-center">
          {showHeaderLogo ? (
            <img src="/src/assets/wflogo.png" alt="wflogo" className="h-10 object-contain" />
          ) : null}
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-purple-600" />
            <span>Live</span>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span>{formatDate(liveClock)}</span>
            <span className="text-gray-300">|</span>
            <span>{formatTime(liveClock)}</span>
          </div>
        </div>
      </header>
      <div className="relative z-10 mx-auto w-full max-w-[1680px] px-5 pb-8 md:px-8 lg:px-10">{children}</div>
    </main>
  );
}
