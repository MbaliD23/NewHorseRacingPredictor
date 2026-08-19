import { ArrowRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { HorseSplitView } from "@/components/analytics/HorseSplitView";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { useRace } from "@/hooks/useRace";
import { usePredictionStore } from "@/store/predictionStore";

export function HorseDetailsPage() {
  const { horseId } = useParams();
  const navigate = useNavigate();
  const { currentHorse, currentRace, setCurrentHorse } = usePredictionStore();
  const raceQuery = useRace(currentHorse?.race_id ?? currentRace?.id);
  const horse =
    currentHorse ?? raceQuery.data?.horses.find((item) => String(item.id) === horseId) ?? null;

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
          raceTitle={currentRace?.title ?? raceQuery.data?.title ?? undefined}
          raceNumber={currentRace?.race_number ?? raceQuery.data?.race_number ?? undefined}
          venueName={currentRace?.venue ?? raceQuery.data?.venue ?? undefined}
          horses={raceQuery.data?.horses ?? currentRace?.horses}
          footerActions={
            <div className="flex items-center justify-center max-w-4xl mx-auto pb-4">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-lg shadow-purple-600/20"
                onClick={() => {
                  if (horse) setCurrentHorse(horse);
                  navigate(`/analysis/${horse?.race_id ?? currentRace?.id}`);
                }}
                disabled={!horse?.race_id && !currentRace?.id}
              >
                Go To Prediction Factor Selection <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          }
        />
      </AsyncBoundary>
    </section>
  );
}

