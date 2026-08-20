import { useNavigate, useParams } from "react-router-dom";
import { PredictorButton } from "@/components/common/Button";
import { HorseSplitView } from "@/components/analytics/HorseSplitView";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { useRace } from "@/hooks/useRace";
import { usePredictionStore } from "@/store/predictionStore";
import type { Horse } from "@/types/race";

export function HorseDetailsPage() {
  const { horseId } = useParams();
  const navigate = useNavigate();
  const { currentHorse, currentRace, setCurrentHorse } = usePredictionStore();
  const raceQuery = useRace(currentHorse?.race_id ?? currentRace?.id);
  const race = raceQuery.data ?? currentRace;
  const horses = race?.horses ?? currentRace?.horses ?? [];

  // Find horse matching horseId from url param or store
  const horse =
    (horseId ? horses.find((item) => String(item.id) === String(horseId)) : null) ??
    (horseId && String(currentHorse?.id) === String(horseId) ? currentHorse : null) ??
    currentHorse ??
    horses[0] ??
    null;

  const handleSelectHorse = (newHorse: Horse) => {
    setCurrentHorse(newHorse);
    navigate(`/horses/${newHorse.id}`);
  };

  return (
    <section className="w-full h-full min-h-0 py-0">
      <AsyncBoundary
        isLoading={raceQuery.isLoading && !horse}
        isError={raceQuery.isError && !horse}
        isEmpty={!horse}
        emptyMessage="Horse unavailable. The backend does not expose a standalone JSON horse detail endpoint."
      >
        <HorseSplitView
          horse={horse}
          raceTitle={race?.title ?? undefined}
          raceNumber={race?.race_number ?? undefined}
          raceDistance={race?.distance ?? currentRace?.distance ?? undefined}
          venueName={race?.venue ?? undefined}
          horses={horses}
          onSelectHorse={handleSelectHorse}
          footerActions={
            <div className="flex items-center justify-center max-w-4xl mx-auto pb-4">
              <PredictorButton
                raceId={horse?.race_id ?? currentRace?.id}
                onClick={() => {
                  if (horse) setCurrentHorse(horse);
                  navigate(`/analysis/${horse?.race_id ?? currentRace?.id}`);
                }}
                disabled={!horse?.race_id && !currentRace?.id}
                className="w-full sm:w-auto min-w-[280px]"
              />
            </div>
          }
        />
      </AsyncBoundary>
    </section>
  );
}

