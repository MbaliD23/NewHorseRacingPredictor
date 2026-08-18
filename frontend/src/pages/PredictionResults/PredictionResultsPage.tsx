import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, BarChart3, BadgeCheck, Flame, Gauge, Medal, Scale, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { cn, valueOrUnavailable } from "@/lib/utils";
import { usePredictionStore } from "@/store/predictionStore";
import { predictionVariableLabels } from "@/types/prediction";

const rankAccentMap: Record<1 | 2 | 3, { tone: string; glow: string }> = {
  1: { tone: "#d4a72c", glow: "rgba(212, 167, 44, 0.18)" },
  2: { tone: "#8b5cf6", glow: "rgba(139, 92, 246, 0.18)" },
  3: { tone: "#7c3aed", glow: "rgba(124, 58, 237, 0.16)" },
};

const rankLabels: Record<1 | 2 | 3, string> = {
  1: "1st Prediction",
  2: "2nd Prediction",
  3: "3rd Prediction",
};

export function PredictionResultsPage() {
  const navigate = useNavigate();
  const { predictionResult, selectedVariables, currentRace, currentHorse, setCurrentHorse } = usePredictionStore();
  const predictions = predictionResult?.predictions ?? [];
  const weightedBy = predictionResult?.selected_variables ?? selectedVariables;

  return (
    <section className="page-section screen-shell prediction-results-page light-theme min-h-[calc(100vh-96px)]">
      <div className="page-heading page-heading-wide light-heading prediction-results-heading">
        <h1>
          Top <span>Predictions</span>
        </h1>
        <p>
          {currentRace?.title
            ? `${currentRace.title} ranked through your selected analysis mix.`
            : "Algorithmic ranking based on your selected factors."}
        </p>
        <div className="prediction-weighted-by">
          {weightedBy.map((variable) => (
            <span className="prediction-chip" key={variable}>
              {predictionVariableLabels[variable]}
            </span>
          ))}
        </div>
      </div>

      <AsyncBoundary isEmpty={predictions.length === 0} emptyMessage="No prediction result available.">
        <div className="prediction-grid prediction-grid--premium">
          {predictions.map((item, index) => {
            const selected = currentHorse?.id === item.horse_id;
            const matchingHorse = currentRace?.horses.find((horse) => horse.id === item.horse_id) ?? null;
            const rank = item.predicted_position;
            const accent = rankAccentMap[rank];

            function openSelectedHorse() {
              setCurrentHorse(matchingHorse);
              navigate(`/predictions/horses/${item.horse_id}`);
            }

            return (
              <article
                key={`${item.horse_id ?? item.horse_name ?? index}`}
                className={cn(
                  "prediction-results-card prediction-card-selectable",
                  `prediction-results-card--rank-${rank}`,
                  selected && "selected",
                )}
                onClick={openSelectedHorse}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openSelectedHorse();
                  }
                }}
                role="button"
                tabIndex={0}
                style={
                  {
                    "--prediction-accent": accent.tone,
                    "--prediction-accent-soft": accent.glow,
                  } as CSSProperties
                }
              >
                <div className="prediction-card-shell">
                  <div className="prediction-card-head">
                    <div className="prediction-rank-stack">
                      <div className="prediction-rank-badge">
                        <Medal className="h-4 w-4" />
                        <span>{rankLabels[rank]}</span>
                      </div>
                      <div className="prediction-position-pill">
                        <span>Rank</span>
                        <strong>{rank}</strong>
                      </div>
                    </div>
                    {item.runner_number ? <div className="horse-number prediction-runner-number">{item.runner_number}</div> : null}
                  </div>

                  <div className="prediction-card-copy">
                    {item.horse_name ? <h2>{item.horse_name}</h2> : null}
                    <div className="prediction-score-strip">
                      {typeof item.overall_score === "number" ? (
                        <Metric
                          icon={<BarChart3 className="h-4 w-4" />}
                          label="Overall Score"
                          value={formatScore(item.overall_score)}
                          tone="score"
                        />
                      ) : null}
                      {typeof item.confidence_percent === "number" ? (
                        <Metric
                          icon={<Trophy className="h-4 w-4" />}
                          label="Confidence"
                          value={`${formatPercent(item.confidence_percent)}%`}
                          tone="confidence"
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="prediction-metrics-grid">
                    <Metric label="Weight" value={formatWeight(item.weight_value)} icon={<Scale className="h-4 w-4" />} />
                    <Metric label="Draw" value={formatDraw(item.draw_number)} icon={<BadgeCheck className="h-4 w-4" />} />
                    <Metric
                      label="Speed Index"
                      value={formatMetric(item.speed_index)}
                      icon={<Gauge className="h-4 w-4" />}
                    />
                    <Metric
                      label="Predicted Time"
                      value={formatMetric(item.predicted_time)}
                      icon={<Flame className="h-4 w-4" />}
                    />
                    <Metric
                      label="Previous Run"
                      value={formatMetric(item.previous_run_rating)}
                      icon={<BarChart3 className="h-4 w-4" />}
                    />
                    <Metric
                      label="Strongest"
                      value={valueOrUnavailable(item.strongest_metric)}
                      icon={<BadgeCheck className="h-4 w-4" />}
                    />
                  </div>

                  <div className="prediction-footer">
                    <div className="prediction-key-factors">
                      {item.key_factors?.length ? (
                        item.key_factors.map((factor) => (
                          <span className="prediction-chip prediction-chip--soft" key={factor}>
                            {factor}
                          </span>
                        ))
                      ) : (
                        <span className="prediction-chip prediction-chip--soft">Structured for factor-led analysis</span>
                      )}
                    </div>
                    {item.notes ? <p className="prediction-notes">{item.notes}</p> : null}
                    <div className="prediction-action-row">
                      <Button variant="outline" className="pointer-events-none justify-self-start">
                        View Horse <ArrowRight className="h-5 w-5" />
                      </Button>
                      {item.weakest_metric ? <span className="prediction-weakest">{valueOrUnavailable(item.weakest_metric)}</span> : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {predictionResult?.notes ? (
          <div className="prediction-notes-card w-full p-5 text-center">{predictionResult.notes}</div>
        ) : null}
      </AsyncBoundary>

    </section>
  );
}

function Metric({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon?: ReactNode;
  label: string;
  value: string | number;
  tone?: "default" | "score" | "confidence";
}) {
  return (
    <div className={cn("prediction-metric", tone !== "default" && `prediction-metric--${tone}`)}>
      <div className="prediction-metric-label">
        {icon ? <span className="prediction-metric-icon">{icon}</span> : null}
        <p>{label}</p>
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function formatMetric(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "Unavailable";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatScore(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatPercent(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatWeight(value: number | null | undefined) {
  const formatted = formatMetric(value);
  return formatted === "Unavailable" ? formatted : `${formatted} kg`;
}

function formatDraw(value: number | null | undefined) {
  const formatted = formatMetric(value);
  return formatted === "Unavailable" ? formatted : `Gate ${formatted}`;
}
