import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Flame,
  Gauge,
  Medal,
  Scale,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { BackButton } from "@/components/navigation/BackButton";
import { usePredictionStore } from "@/store/predictionStore";
import { predictionVariableLabels } from "@/types/prediction";

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
    <section className="page-section screen-shell w-full gap-6 py-4">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-2 sm:px-4 lg:px-6">
        {/* Centered Header Card */}
        <div className="relative rounded-[32px] border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131424]/90 px-4 py-6 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] sm:px-6 lg:px-8">
          <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
            <BackButton
              to={currentRace?.id ? `/analysis/${currentRace.id}` : "/"}
              fallbackTo={currentRace?.id ? `/analysis/${currentRace.id}` : "/"}
              label="Back to Factors"
            />
          </div>

          <div className="flex flex-col items-center justify-center text-center w-full max-w-3xl mx-auto pt-2 sm:pt-0">
            <h1 className="text-[clamp(2rem,3.4vw,3.4rem)] font-black leading-[1.05] tracking-tight text-slate-950 dark:text-white">
              Top <span className="text-[#6A2DF1]">Predictions</span>
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
              {currentRace?.title
                ? `${currentRace.title} ranked through your selected factor weighting.`
                : "Algorithmic ranking based on your selected factors."}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {weightedBy.map((variable) => (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/90 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 px-3.5 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-2xs"
                  key={variable}
                >
                  <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  {predictionVariableLabels[variable]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <AsyncBoundary
          isEmpty={predictions.length === 0}
          emptyMessage={
            <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center space-y-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-purple-100 dark:border-slate-800 my-8">
              <div className="flex h-12 w-12 shrink-0 aspect-square items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                <Trophy className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Please select an event and race first</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                To view predictions, please select an event and race to configure and run the algorithm.
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
            {predictions.map((item, index) => {
              const matchingHorse = currentRace?.horses.find((horse) => horse.id === item.horse_id) ?? null;
              const rank = (item.predicted_position ?? (index + 1)) as 1 | 2 | 3;

              function openSelectedHorse() {
                setCurrentHorse(matchingHorse);
                navigate(`/predictions/horses/${item.horse_id}`);
              }

              return (
                <article
                  key={`${item.horse_id ?? item.horse_name ?? index}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#131424]/90 p-5 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 hover:bg-slate-900/90 hover:backdrop-blur-md hover:border-purple-600 hover:ring-[3px] hover:ring-purple-600 hover:shadow-[0_12px_40px_rgb(0,0,0,0.25)] hover:-translate-y-1 cursor-pointer"
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
                  <div className="flex flex-col gap-4">
                    {/* Top Header: Unified Purple Rank Badge */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300">
                        <Medal className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        <span>{rankLabels[rank] ?? `Rank #${rank}`}</span>
                      </div>
                    </div>

                    {/* Horse Name */}
                    <div>
                      <h2 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-white group-hover:text-white transition-colors duration-300">
                        {item.horse_name ?? `Horse #${item.runner_number ?? index + 1}`}
                      </h2>
                    </div>

                    {/* Unified Score & Confidence Summary Strip */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {typeof item.overall_score === "number" && (
                        <div className="flex flex-col rounded-xl border border-purple-200/70 dark:border-purple-900/40 bg-purple-50/60 dark:bg-purple-950/40 p-2.5 group-hover:border-white/10 group-hover:bg-white/5 transition-colors duration-300">
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 group-hover:text-purple-300">
                            <BarChart3 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 group-hover:text-purple-300" />
                            <span>Score</span>
                          </div>
                          <p className="mt-1 text-lg font-black text-slate-950 dark:text-white group-hover:text-white">
                            {formatScore(item.overall_score)}
                          </p>
                        </div>
                      )}

                      {typeof item.confidence_percent === "number" && (
                        <div className="flex flex-col rounded-xl border border-purple-200/70 dark:border-purple-900/40 bg-purple-50/60 dark:bg-purple-950/40 p-2.5 group-hover:border-white/10 group-hover:bg-white/5 transition-colors duration-300">
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 group-hover:text-purple-300">
                            <Trophy className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 group-hover:text-purple-300" />
                            <span>Confidence</span>
                          </div>
                          <p className="mt-1 text-lg font-black text-slate-950 dark:text-white group-hover:text-white">
                            {formatPercent(item.confidence_percent)}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Metric Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <MetricCard label="Weight" value={formatWeight(item.weight_value)} icon={<Scale className="h-3.5 w-3.5" />} />
                      <MetricCard label="Draw" value={formatDraw(item.draw_number)} icon={<BadgeCheck className="h-3.5 w-3.5" />} />
                      <MetricCard label="Speed Index" value={formatMetric(item.speed_index)} icon={<Gauge className="h-3.5 w-3.5" />} />
                      <MetricCard label="Predicted Time" value={formatMetric(item.predicted_time)} icon={<Flame className="h-3.5 w-3.5" />} />
                      <MetricCard label="Previous Run" value={formatMetric(item.previous_run_rating)} icon={<BarChart3 className="h-3.5 w-3.5" />} />
                      <MetricCard label="Strongest" value={formatMetric(item.speed_index ?? item.previous_run_rating)} icon={<BadgeCheck className="h-3.5 w-3.5" />} />
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 group-hover:border-white/10 transition-colors duration-300">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 px-4 py-2.5 text-xs font-bold text-[#6A2DF1] dark:text-purple-300 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-500 group-hover:shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] cursor-pointer"
                    >
                      View Horse
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </AsyncBoundary>
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 p-2 group-hover:border-white/10 group-hover:bg-white/5 transition-colors duration-300">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-400">
        {icon && <span className="text-purple-600 dark:text-purple-400 group-hover:text-purple-400">{icon}</span>}
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-0.5 truncate font-bold text-slate-900 dark:text-white group-hover:text-white">
        {value}
      </p>
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
