import React from "react";
import type { Horse } from "@/types/race";
import { HorseAnalysisView } from "@/components/horse/HorseAnalysisView";
import { RadarAnalyticsView } from "./RadarAnalyticsView";

interface HorseSplitViewProps {
  horse: Horse | null;
  raceTitle?: string;
  raceNumber?: number;
  venueName?: string;
  horses?: Horse[];
  footerActions?: React.ReactNode;
}

export function HorseSplitView({
  horse,
  raceTitle,
  raceNumber,
  venueName,
  horses,
  footerActions,
}: HorseSplitViewProps) {
  return (
    <div className="w-full max-w-none h-full min-h-0 flex flex-col p-1.5 sm:p-2.5">
      {/* Dynamic responsive grid: balanced fractional sizing so neither side is squashed when sidebar is open */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(400px,1.15fr)_minmax(420px,1.25fr)] 2xl:grid-cols-[minmax(480px,1.2fr)_minmax(480px,1.2fr)] gap-3 items-stretch w-full xl:h-full min-h-0">
        
        {/* Left Column: Complete Horse Information details with ghost independent scrolling */}
        <div className="w-full h-full flex flex-col overflow-y-auto pb-6 min-h-0 no-scrollbar">

          <HorseAnalysisView
            horse={horse}
            raceTitle={raceTitle}
            raceNumber={raceNumber}
            venueName={venueName}
          />
          {footerActions && <div className="mt-4 px-2">{footerActions}</div>}
        </div>

        {/* Right Column (50%): Radar Analytics view with ghost independent scrolling */}
        <div className="w-full h-full flex flex-col overflow-y-auto pb-6 min-h-0 no-scrollbar">
          <RadarAnalyticsView
            selectedHorseId={horse?.id}
            selectedHorseName={horse?.name}
            horses={horses}
            isEmbedded
          />
        </div>

      </div>
    </div>
  );
}
