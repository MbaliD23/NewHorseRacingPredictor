import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
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
        <div className="brand-mark" aria-label="Hollywoodbets">
          <span className="brand-star" aria-hidden="true">
            <span className="brand-star-core" />
          </span>
          <div className="brand-lockup">
            <span className="brand-script">Hollywood</span>
            <span className="brand-bets">bets</span>
          </div>
        </div>
        <div className="header-status">
          <div className="status-meta">
            <span>{formatDate(liveClock)}</span>
            <span>{formatTime(liveClock)}</span>
          </div>
          <div className="status-meta hidden sm:flex">
            <span>Last Sync</span>
            <span>{formatTime(data?.last_scrape_at ?? null)}</span>
          </div>
        </div>
      </header>
      <div className="relative z-10 mx-auto w-full max-w-[1680px] px-5 pb-8 md:px-8 lg:px-10">{children}</div>
    </main>
  );
}
