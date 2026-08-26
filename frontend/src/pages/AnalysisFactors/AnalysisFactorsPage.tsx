import { type CSSProperties, useMemo, useState } from "react";
import { BarChart3, Check, Clock, Gauge, Goal, Info, Scale, Sparkles, Trophy } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { BackButton } from "@/components/navigation/BackButton";
import { usePrediction } from "@/hooks/usePrediction";
import { useRace } from "@/hooks/useRace";
import { usePredictionStore } from "@/store/predictionStore";
import { predictionVariableLabels, type PredictionVariable } from "@/types/prediction";
import horseImg from "@/assets/3DHorseBlack.png";

const factors: Array<{
  code: PredictionVariable;
  Icon: typeof Trophy;
  explanation: string;
  centerAngle: number;
}> = [
  {
    code: "trainer_jockey_win_percent",
    Icon: Trophy,
    centerAngle: 240,
    explanation:
      "Evaluates the partnership record, win strike rate, and current synergy between the trainer and jockey for this runner.",
  },
  {
    code: "speed_index",
    Icon: Gauge,
    centerAngle: 300,
    explanation:
      "Analyzes the horse's ability to produce competitive split times and peak cruising speed adjusted for course and track conditions.",
  },
  {
    code: "draw_advantage",
    Icon: Goal,
    centerAngle: 0,
    explanation:
      "Considers barrier gate position and its historical statistical advantage/bias over this specific distance and track layout.",
  },
  {
    code: "previous_run",
    Icon: BarChart3,
    centerAngle: 60,
    explanation:
      "Assesses the horse's most recent form, finishing position, margins, and race fitness from its latest outing.",
  },
  {
    code: "weight",
    Icon: Scale,
    centerAngle: 120,
    explanation:
      "Evaluates the assigned weight/mass carried and any jockey claiming allowances relative to the rest of the field.",
  },
  {
    code: "predicted_time",
    Icon: Clock,
    centerAngle: 180,
    explanation:
      "Estimates the projected race finishing time based on past adjusted times, class standards, and track conditions.",
  },
];

const wheelSegments = factors.map((factor) => ({
  ...factor,
  startAngle: factor.centerAngle - 30,
  endAngle: factor.centerAngle + 30,
}));

function polarToCartesian(center: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  };
}

function describeSegment(startAngle: number, endAngle: number) {
  const center = 260;
  const outerRadius = 224;
  const innerRadius = 76;
  const outerStart = polarToCartesian(center, outerRadius, startAngle);
  const outerEnd = polarToCartesian(center, outerRadius, endAngle);
  const innerStart = polarToCartesian(center, innerRadius, startAngle);
  const innerEnd = polarToCartesian(center, innerRadius, endAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function labelPosition(angleInDegrees: number): CSSProperties {
  const wheelInsetPercent = 3.5;
  const svgPercent = 93;
  const point = polarToCartesian(260, 150, angleInDegrees);

  return {
    left: `${wheelInsetPercent + (point.x / 520) * svgPercent}%`,
    top: `${wheelInsetPercent + (point.y / 520) * svgPercent}%`,
  };
}

export function AnalysisFactorsPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const { data: race, isLoading, isError } = useRace(raceId);
  const prediction = usePrediction();
  const { selectedVariables, setSelectedVariables, currentRace, currentHorse, setCurrentRace, setPredictionResult } = usePredictionStore();
  const [activeInfo, setActiveInfo] = useState<PredictionVariable | null>(null);

  const activeFactor = useMemo(() => factors.find((factor) => factor.code === activeInfo), [activeInfo]);

  function toggleFactor(code: PredictionVariable) {
    const exists = selectedVariables.includes(code);
    if (exists) {
      setSelectedVariables(selectedVariables.filter((item) => item !== code));
      if (activeInfo === code) setActiveInfo(null);
      return;
    }
    if (selectedVariables.length < 3) setSelectedVariables([...selectedVariables, code]);
  }

  async function handleProceed() {
    if (!raceId || selectedVariables.length !== 3) return;
    const result = await prediction.mutateAsync({
      race_id: Number(raceId),
      selected_variables: selectedVariables,
    });
    setCurrentRace(race ?? null);
    setPredictionResult(result);
    navigate("/predictions/results");
  }

  return (
    <section className="page-section screen-shell analysis-page light-theme min-h-[calc(100vh-96px)]">
      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-center px-4 mb-4 sm:mb-6">
        <div className="w-full flex items-center justify-center relative">
          <div className="sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2">
            <BackButton
              to={currentHorse?.id ? `/horses/${currentHorse.id}` : raceId ? `/races/${raceId}` : currentRace?.id ? `/races/${currentRace.id}` : "/"}
              fallbackTo={currentHorse?.id ? `/horses/${currentHorse.id}` : raceId ? `/races/${raceId}` : "/"}
              label="Back to Horse Analysis"
            />
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Choose Your <span className="text-purple-600 dark:text-purple-400">Analysis Factors</span>
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Select up to 3 factors to weight the prediction algorithm
            </p>
          </div>
        </div>
      </div>

      <AsyncBoundary
        isLoading={isLoading}
        isError={isError}
        isEmpty={!race}
        emptyMessage={
          <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center space-y-4 rounded-2xl bg-white shadow-sm border border-purple-100 my-8">
            <div className="flex h-12 w-12 shrink-0 aspect-square items-center justify-center rounded-full bg-purple-100 text-purple-700">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Please select an event and race first</h2>
            <p className="text-sm text-slate-500">
              To configure predictor analysis factors, please select an active event and race from the navigation.
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
        <div className="factor-layout">
          <div className="factor-left-col">
            <div className="factor-wheel">
              <svg className="factor-wheel-svg" viewBox="0 0 520 520" role="presentation" aria-hidden="true">
                {wheelSegments.map((factor) => {
                  const selected = selectedVariables.includes(factor.code);
                  return (
                    <path
                      key={factor.code}
                      className={`wheel-wedge ${selected ? "selected" : ""}`}
                      d={describeSegment(factor.startAngle, factor.endAngle)}
                      onClick={() => toggleFactor(factor.code)}
                    />
                  );
                })}
              </svg>
              <div className="wheel-center">
                <strong>{selectedVariables.length}/3</strong>
                <span>SELECTED</span>
              </div>
              {wheelSegments.map((factor, index) => {
                const selected = selectedVariables.includes(factor.code);
                const isActive = activeInfo === factor.code;
                const Icon = factor.Icon;
                return (
                  <div
                    key={factor.code}
                    className="factor-segment-container"
                    style={labelPosition(factor.centerAngle)}
                  >
                    <button
                      className={`factor-segment segment-${index} ${selected ? "selected" : ""} relative flex flex-col items-center justify-center`}
                      type="button"
                      onClick={() => toggleFactor(factor.code)}
                      onMouseEnter={() => setActiveInfo(factor.code)}
                      onMouseLeave={() => setActiveInfo(null)}
                    >
                      {/* Standardized Info Icon in Top-Right */}
                      <span
                        className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full border border-purple-400/50 text-purple-300 hover:text-white hover:border-purple-300 bg-slate-900/60 transition-colors z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveInfo(activeInfo === factor.code ? null : factor.code);
                        }}
                        title="Factor info"
                      >
                        <Info className="h-2.5 w-2.5" />
                      </span>

                      {/* Slice Core Content */}
                      <div className="flex flex-col items-center justify-center text-center gap-1 w-full px-1">
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 shrink-0" />
                        <span className="text-xs sm:text-[0.8rem] font-bold leading-tight max-w-[105px]">
                          {predictionVariableLabels[factor.code]}
                        </span>
                      </div>

                      {/* Fixed height checkmark placeholder */}
                      <div className="h-4 flex items-center justify-center mt-0.5">
                        {selected ? (
                          <span className="flex items-center justify-center h-4 w-4 rounded-full bg-purple-600 text-white shadow-sm shadow-purple-500/50">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        ) : null}
                      </div>
                    </button>

                    {isActive && (
                      <div className={`factor-description-card tooltip-angle-${factor.centerAngle}`}>
                        <div className="factor-desc-header">
                          <Icon className="h-4 w-4 text-purple-400 shrink-0" />
                          <h3>{predictionVariableLabels[factor.code]}</h3>
                        </div>
                        <p className="factor-desc-text">{factor.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="factor-right-col">
            <img src={horseImg} alt="3D Horse" className="analysis-horse-image" />
          </div>
        </div>

        <div className="analysis-bottom-section">
          <Button size="lg" className="prediction-cta solid-purple-btn" onClick={handleProceed} disabled={selectedVariables.length !== 3 || prediction.isPending}>
            <Sparkles className="h-5 w-5" /> {prediction.isPending ? "Running Prediction" : "Proceed to Predictions"}
          </Button>
        </div>
        {prediction.isError ? (
          <GlassCard className="p-4 text-center text-red-200">
            Prediction unavailable. The backend rejected or could not complete the request.
          </GlassCard>
        ) : null}

        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center max-w-2xl mx-auto mt-6 px-4 py-2 border-t border-slate-200/50 dark:border-slate-800/50">
          Disclaimer: Algorithmic predictions and ratings are provided for informational and entertainment purposes only and are not guaranteed to be 100% accurate. Winning Form and its affiliates accept no liability for any financial losses or betting decisions incurred.
        </p>
      </AsyncBoundary>
    </section>
  );
}
