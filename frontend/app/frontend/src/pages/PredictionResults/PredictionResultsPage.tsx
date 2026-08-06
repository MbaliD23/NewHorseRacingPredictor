import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { valueOrUnavailable } from "@/lib/utils";
import { usePredictionStore } from "@/store/predictionStore";
import { predictionVariableLabels } from "@/types/prediction";

export function PredictionResultsPage() {
  const navigate = useNavigate();
  const { predictionResult, selectedVariables, currentRace, currentHorse, setCurrentHorse } = usePredictionStore();
  const predictions = predictionResult?.predictions ?? [];
  const weightedBy = predictionResult?.selected_variables ?? selectedVariables;

  return (
    <section className="page-section screen-shell min-h-[calc(100vh-96px)]">
      <div className="page-heading page-heading-wide">
        <h1>
          Top <span>Predictions</span>
        </h1>
        <p>{currentRace?.title ? `${currentRace.title} refined through your selected analysis mix.` : "Algorithmic ranking based on your selected factors."}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {weightedBy.map((variable) => (
            <span className="selected-chip" key={variable}>
              {predictionVariableLabels[variable]}
            </span>
          ))}
        </div>
      </div>

      <AsyncBoundary isEmpty={predictions.length === 0} emptyMessage="No prediction result available.">
        <div className="prediction-grid">
          {predictions.map((item, index) => {
            const selected = currentHorse?.id === item.horse_id;
            const matchingHorse = currentRace?.horses.find((horse) => horse.id === item.horse_id) ?? null;

            function openSelectedHorse() {
              setCurrentHorse(matchingHorse);
              navigate(`/predictions/horses/${item.horse_id}`);
            }

            return (
              <GlassCard
                key={`${item.horse_id ?? item.horse_name ?? index}`}
                className={`prediction-card prediction-card-selectable ${selected ? "selected" : ""}`}
                onClick={openSelectedHorse}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openSelectedHorse();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {item.predicted_position ? <div className="podium-badge">{item.predicted_position}</div> : null}
                {item.horse_name ? <h2>{item.horse_name}</h2> : null}
                <div className="mt-8 grid gap-5">
                  {typeof item.overall_score === "number" ? <Metric label="Score" value={item.overall_score} /> : null}
                  {typeof item.confidence_percent === "number" ? (
                    <div className="confidence-panel">
                      <Metric label="Confidence" value={`${item.confidence_percent}%`} />
                      <div className="confidence-track">
                        <span style={{ width: `${Math.max(0, Math.min(100, item.confidence_percent))}%` }} />
                      </div>
                    </div>
                  ) : null}
                  <div className="grid gap-2 text-sm text-violet-100/75">
                    <p>Trainer: {valueOrUnavailable(item.trainer_name)}</p>
                    <p>Jockey: {valueOrUnavailable(item.jockey_name)}</p>
                    <p>Draw: {valueOrUnavailable(item.draw_number)}</p>
                    <p>Weight: {valueOrUnavailable(item.weight_value)}</p>
                    <p>Trainer/Jockey Combination: {valueOrUnavailable(item.trainer_jockey_win_percent)}</p>
                    <p>Speed Index: {valueOrUnavailable(item.speed_index)}</p>
                    <p>Predicted Time: {valueOrUnavailable(item.predicted_time)}</p>
                    <p>Previous Run: {valueOrUnavailable(item.previous_run_rating)}</p>
                    <p>Strongest Metric: {valueOrUnavailable(item.strongest_metric)}</p>
                    <p>Weakest Metric: {valueOrUnavailable(item.weakest_metric)}</p>
                  </div>
                  {item.notes ? <p className="text-violet-100/75">{item.notes}</p> : null}
                  {item.key_factors?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {item.key_factors.map((factor) => (
                        <span className="selected-chip" key={factor}>
                          {factor}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <Button variant="outline" className="pointer-events-none justify-self-start">
                    View Horse <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
        {predictionResult?.notes ? (
          <GlassCard className="w-full p-5 text-center text-violet-100/75">{predictionResult.notes}</GlassCard>
        ) : null}
      </AsyncBoundary>

      <div className="page-actions mt-auto">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            if (currentRace?.id) {
              navigate(`/analysis/${currentRace.id}`);
            } else {
              navigate(-1);
            }
          }}
        >
          <ArrowLeft className="h-6 w-6" />
          Previous
        </Button>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-sm uppercase text-violet-100/60">{label}</p>
      <strong className="text-3xl text-white">{value}</strong>
    </div>
  );
}
