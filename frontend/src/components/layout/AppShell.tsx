import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { BackButton } from "@/components/navigation/BackButton";
import { useStatus } from "@/hooks/useStatus";
import { formatDate, formatTime } from "@/lib/utils";
import { usePredictionStore } from "@/store/predictionStore";

export function AppShell({ children }: PropsWithChildren) {
  const { data } = useStatus();
  const [liveClock, setLiveClock] = useState(() => new Date());
  const location = useLocation();
  const currentVenue = usePredictionStore((state) => state.currentVenue);
  const currentRace = usePredictionStore((state) => state.currentRace);
  const showHeaderLogo = location.pathname !== "/";
  const showWorkflowBackButton = location.pathname !== "/";

  const backFallback = (() => {
    const pathname = location.pathname;

    if (matchPath("/venues/:venueId", pathname)) {
      return "/";
    }

    if (matchPath("/races/:raceId", pathname)) {
      return currentVenue?.id ? `/venues/${currentVenue.id}` : "/";
    }

    if (matchPath("/horses/:horseId", pathname)) {
      return currentRace?.id ? `/races/${currentRace.id}` : "/";
    }

    if (matchPath("/analysis/:raceId", pathname)) {
      return currentRace?.id ? `/races/${currentRace.id}` : "/";
    }

    if (matchPath("/predictions/results", pathname)) {
      return currentRace?.id ? `/analysis/${currentRace.id}` : "/";
    }

    if (matchPath("/predictions/horses/:horseId", pathname)) {
      return "/predictions/results";
    }

    return "/";
  })();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveClock(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      <header className="relative z-10 flex items-center justify-between gap-4 px-6 py-3 md:px-10 md:py-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {showHeaderLogo ? (
            <img
              src="/src/assets/wflogo.png"
              alt="wflogo"
              className="h-[52px] w-auto object-contain sm:h-[56px] md:h-[58px]"
            />
          ) : null}
          {showWorkflowBackButton ? (
            <BackButton
              label="Back"
              showLabel
              fallbackTo={backFallback}
            />
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
      <div className="relative z-10 mx-auto w-full max-w-[1680px] px-5 pb-8 md:px-8 md:pb-10 lg:px-10">
        {children}
      </div>
    </main>
  );
}
