import { RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { HorseAnalysisView } from "@/components/horse/HorseAnalysisView";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { usePredictionStore } from "@/store/predictionStore";

export function SelectedHorsePage() {
  const { horseId } = useParams();
  const navigate = useNavigate();
  const { currentHorse, currentRace, predictionResult, resetFlow } = usePredictionStore();

  const prediction = useMemo(() => {
    return predictionResult?.predictions.find((item) => String(item.horse_id) === horseId) ?? null;
  }, [horseId, predictionResult?.predictions]);

  const raceHorse = useMemo(() => {
    return currentRace?.horses.find((horse) => String(horse.id) === horseId) ?? null;
  }, [currentRace?.horses, horseId]);

  const horse = currentHorse?.id && String(currentHorse.id) === horseId ? currentHorse : raceHorse;

  return (
    <section className="page-section screen-shell py-4">
      <AsyncBoundary isEmpty={!horse && !prediction} emptyMessage="Selected horse data is unavailable for this prediction.">
        <HorseAnalysisView
          horse={horse}
          raceTitle={currentRace?.title ?? undefined}
          raceNumber={currentRace?.race_number ?? undefined}
          venueName={currentRace?.venue ?? undefined}
        />
      </AsyncBoundary>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 max-w-4xl mx-auto pb-6 w-full px-2">
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
    </section>
  );
}
