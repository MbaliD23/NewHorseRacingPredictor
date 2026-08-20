import { ArrowLeft, RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { HorseSplitView } from "@/components/analytics/HorseSplitView";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { usePredictionStore } from "@/store/predictionStore";
import type { Horse } from "@/types/race";

export function SelectedHorsePage() {
  const { horseId } = useParams();
  const navigate = useNavigate();
  const { currentHorse, currentRace, setCurrentHorse, predictionResult, resetFlow } = usePredictionStore();

  const prediction = useMemo(() => {
    return predictionResult?.predictions.find((item) => String(item.horse_id) === horseId) ?? null;
  }, [horseId, predictionResult?.predictions]);

  const raceHorse = useMemo(() => {
    return currentRace?.horses.find((h) => String(h.id) === horseId) ?? null;
  }, [currentRace?.horses, horseId]);

  const horse = (horseId && String(currentHorse?.id) === horseId ? currentHorse : raceHorse) ?? currentHorse ?? null;

  const handleSelectHorse = (newHorse: Horse) => {
    setCurrentHorse(newHorse);
    navigate(`/predictions/horses/${newHorse.id}`);
  };

  return (
    <section className="w-full h-full min-h-0 py-0">
      <AsyncBoundary
        isEmpty={!horse && !prediction}
        emptyMessage={
          <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center space-y-4 rounded-2xl bg-white shadow-sm border border-purple-100 my-8">
            <h2 className="text-lg font-bold text-slate-900">Please select an event and race first</h2>
            <p className="text-sm text-slate-500">
              Selected horse prediction details are unavailable without an active prediction run.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="rounded-full px-6 bg-purple-700 hover:bg-purple-800 text-white font-bold"
            >
              Select Event & Race
            </Button>
          </div>
        }
      >
        <HorseSplitView
          horse={horse}
          raceTitle={currentRace?.title ?? undefined}
          raceNumber={currentRace?.race_number ?? undefined}
          raceDistance={currentRace?.distance ?? undefined}
          venueName={currentRace?.venue ?? undefined}
          horses={currentRace?.horses}
          onSelectHorse={handleSelectHorse}
          footerActions={
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto pb-4 w-full px-2">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full"
                onClick={() => navigate("/predictions/results")}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Predictions
              </Button>
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full bg-purple-700 hover:bg-purple-800 text-white"
                onClick={() => {
                  resetFlow();
                  navigate("/");
                }}
              >
                Start Over <RotateCcw className="ml-2 h-4 w-4" />
              </Button>
            </div>
          }
        />
      </AsyncBoundary>
    </section>
  );
}

