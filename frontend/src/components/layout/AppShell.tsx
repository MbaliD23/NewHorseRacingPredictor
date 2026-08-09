import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { useStatus } from "@/hooks/useStatus";
import { formatDate, formatTime } from "@/lib/utils";

export function AppShell({ children }: PropsWithChildren) {
  const { data } = useStatus();
  const [liveClock, setLiveClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveClock(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="neon-bg" />
      <header className="app-header">
        <div className="header-status">
          <div className="status-meta light-theme">
            <Calendar className="h-4 w-4" />
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
