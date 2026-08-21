import React, { useState } from "react";
import type { Horse } from "@/types/race";
import { HorseAnalysisView, type HorseViewMode } from "@/components/horse/HorseAnalysisView";
import { RadarAnalyticsView } from "./RadarAnalyticsView";

const VIEW_MODE_STORAGE_KEY = "horse-details-view-mode";

interface HorseSplitViewProps {
  horse: Horse | null;
  raceTitle?: string;
  raceNumber?: number;
  raceDistance?: string | null;
  venueName?: string;
  horses?: Horse[];
  onSelectHorse?: (horse: Horse) => void;
  footerActions?: React.ReactNode;
  initialViewMode?: HorseViewMode;
  onViewModeChange?: (mode: HorseViewMode) => void;
}

export function HorseSplitView({
  horse,
  raceTitle,
  raceNumber,
  raceDistance,
  venueName,
  horses,
  onSelectHorse,
  footerActions,
  initialViewMode = "single",
  onViewModeChange,
}: HorseSplitViewProps) {
  const [viewMode, setViewMode] = useState<HorseViewMode>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
        if (stored === "single" || stored === "split") {
          return stored;
        }
      } catch {
        // Ignore localStorage error
      }
    }
    return initialViewMode;
  });

  const handleViewModeChange = (newMode: HorseViewMode) => {
    setViewMode(newMode);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, newMode);
      } catch {
        // Ignore localStorage error
      }
    }
    onViewModeChange?.(newMode);
  };

  return (
    <div className="w-full max-w-none h-full min-h-0 flex flex-col p-1.5 sm:p-2.5 transition-all duration-300 ease-in-out">
      {viewMode === "single" ? (
        /* Full-Width Horse Analysis layout (default) */
        <div className="w-full max-w-7xl mx-auto h-full flex flex-col overflow-y-auto overflow-x-hidden pb-6 min-h-0 min-w-0 scrollbar-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-all duration-300 ease-in-out">
          <HorseAnalysisView
            horse={horse}
            raceTitle={raceTitle}
            raceNumber={raceNumber}
            raceDistance={raceDistance}
            venueName={venueName}
            horses={horses}
            onSelectHorse={onSelectHorse}
            viewMode="single"
            onViewModeChange={handleViewModeChange}
          />
          {footerActions && <div className="mt-4 px-2">{footerActions}</div>}
        </div>
      ) : (
        /* Seamless 50/50 Split View (Horse Analysis + Radar Chart) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch w-full xl:h-full min-h-0 transition-all duration-300 ease-in-out">
          {/* Left Column (50%): Complete Horse Information details */}
          <div className="w-full h-full flex flex-col overflow-y-auto overflow-x-hidden pb-6 min-h-0 min-w-0 scrollbar-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-all duration-300 ease-in-out pr-0 lg:pr-1.5">
            <HorseAnalysisView
              horse={horse}
              raceTitle={raceTitle}
              raceNumber={raceNumber}
              raceDistance={raceDistance}
              venueName={venueName}
              horses={horses}
              onSelectHorse={onSelectHorse}
              viewMode="split"
              onViewModeChange={handleViewModeChange}
            />
            {footerActions && <div className="mt-4 px-2">{footerActions}</div>}
          </div>

          {/* Right Column (50%): Radar Analytics view */}
          <div className="w-full h-full flex flex-col overflow-y-auto overflow-x-hidden pb-6 min-h-0 min-w-0 scrollbar-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-all duration-300 ease-in-out pl-0 lg:pl-1.5">
            <RadarAnalyticsView
              selectedHorseId={horse?.id}
              selectedHorseName={horse?.name}
              horses={horses}
              onSelectHorse={onSelectHorse}
              isEmbedded
            />
          </div>
        </div>
      )}
    </div>
  );
}
