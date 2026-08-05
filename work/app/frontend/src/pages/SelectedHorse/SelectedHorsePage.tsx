import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { valueOrUnavailable } from "@/lib/utils";
import { usePredictionStore } from "@/store/predictionStore";
import type { PredictionItem } from "@/types/prediction";
import type { Horse } from "@/types/race";

const horseFields = [
  ["Trainer", "trainer_name"],
  ["Trainer Ranking", "trainer_ranking"],
  ["Jockey", "jockey_name"],
  ["Jockey Rating", "jockey_rating"],
  ["Draw", "draw_number"],
  ["Weight", "weight_value"],
  ["Starting Price", "starting_price"],
  ["Previous Run", "previous_run_rating"],
] as const;

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
  const horseName = horse?.name ?? prediction?.horse_name ?? "Selected Horse";

  return (
    <section className="page-section screen-shell min-h-[calc(100vh-96px)]">
      <div className="selected-horse-hero">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Selected Horse</p>
          <h1>{horseName}</h1>
          <p>
            {currentRace?.venue ? `${currentRace.venue} Race ${currentRace.race_number}` : "Prediction-ready horse profile"}
          </p>
        </div>
        {prediction?.predicted_position ? (
          <div className="selected-horse-rank">
            <span>Rank</span>
            <strong>{prediction.predicted_position}</strong>
          </div>
        ) : null}
      </div>

      <AsyncBoundary isEmpty={!horse && !prediction} emptyMessage="Selected horse data is unavailable for this prediction.">
        <div className="selected-horse-layout">
          <GlassCard className="selected-horse-summary">
            <div className="horse-saddle">{valueOrUnavailable(horse?.draw_number ?? prediction?.draw_number ?? horse?.id)}</div>
            <div>
              <h2>{horseName}</h2>
              <p>{valueOrUnavailable(horse?.status)}</p>
            </div>
            <div className="selected-score-grid">
              {typeof prediction?.overall_score === "number" ? <Metric label="Score" value={prediction.overall_score} /> : null}
              {typeof prediction?.confidence_percent === "number" ? <Metric label="Confidence" value={`${prediction.confidence_percent}%`} /> : null}
            </div>
          </GlassCard>

          <div className="detail-grid">
            {horseFields.map(([label, key]) => {
              const value = getHorseMetric(key, horse, prediction);
              return (
                <GlassCard className="detail-tile selected-horse-tile" key={key}>
                  <div>
                    <p>{label}</p>
                    <strong>{valueOrUnavailable(value)}</strong>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {prediction?.key_factors?.length ? (
            <GlassCard className="selected-horse-factors">
              <h2>Key Factors</h2>
              <div className="flex flex-wrap gap-2">
                {prediction.key_factors.map((factor) => (
                  <span className="selected-chip" key={factor}>
                    {factor}
                  </span>
                ))}
              </div>
            </GlassCard>
          ) : null}

          {horse?.notes || prediction?.notes ? (
            <GlassCard className="selected-horse-notes">
              <Sparkles className="h-5 w-5 text-primary" />
              <p>{horse?.notes ?? prediction?.notes}</p>
            </GlassCard>
          ) : null}
        </div>
      </AsyncBoundary>

      <div className="page-actions mt-auto">
        <Button variant="outline" size="lg" onClick={() => navigate("/predictions/results")}>
          <ArrowLeft className="h-6 w-6" />
          Back to Predictions
        </Button>
        <Button
          size="lg"
          onClick={() => {
            resetFlow();
            navigate("/");
          }}
        >
          Start Over <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}

function getHorseMetric(key: (typeof horseFields)[number][1], horse: Horse | null, prediction: PredictionItem | null) {
  switch (key) {
    case "trainer_ranking":
    case "jockey_rating":
      return horse?.[key] ?? null;
    default:
      return horse?.[key] ?? prediction?.[key] ?? null;
  }
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
