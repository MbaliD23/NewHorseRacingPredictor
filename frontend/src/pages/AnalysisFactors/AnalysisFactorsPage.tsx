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
  { code: "trainer_jockey_win_percent", Icon: Trophy, centerAngle: 240, explanation: "Uses the trainer and jockey combination win percentage now exposed by the backend." },
  { code: "speed_index", Icon: Gauge, centerAngle: 300, explanation: "Uses the backend speed index to compare each runner's pace signal." },
  { code: "draw_advantage", Icon: Goal, centerAngle: 0, explanation: "Brings gate position into the model so favourable draws can lift horses suited to the race setup." },
  { code: "previous_run", Icon: BarChart3, centerAngle: 60, explanation: "Uses the latest run signal to recognise horses arriving with stronger recency and momentum." },
  { code: "weight", Icon: Scale, centerAngle: 120, explanation: "Balances the handicap load carried by each runner, helping lighter setups stand out where relevant." },
  { code: "predicted_time", Icon: Clock, centerAngle: 180, explanation: "Uses the backend predicted time as part of the final prediction mix." },
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
  const { selectedVariables, setSelectedVariables, currentRace, setCurrentRace, setPredictionResult } = usePredictionStore();
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
      <div className="page-heading page-heading-wide analysis-heading light-heading">
        <div className="flex items-center gap-3">
          <BackButton
            to={raceId ? `/races/${raceId}` : currentRace?.id ? `/races/${currentRace.id}` : "/"}
            fallbackTo={raceId ? `/races/${raceId}` : currentRace?.id ? `/races/${currentRace.id}` : "/"}
            label="Back to Race"
          />
          <h1 className="text-3xl font-black text-slate-950">
            Choose Your <span className="text-purple-600">Analysis Factors</span>
          </h1>
        </div>
        <p>Select up to 3 factors to weight the prediction algorithm</p>
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
              <div className="wheel-glow" />
              <div className="wheel-ring wheel-ring-outer" />
              <div className="wheel-ring wheel-ring-inner" />
              <div className="wheel-tick-ring" />
              <svg className="factor-wheel-svg" viewBox="0 0 520 520" role="presentation" aria-hidden="true">
                <defs>
                  <radialGradient id="inactiveSegment" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#f8f9fa" stopOpacity="1" />
                  </radialGradient>
                  <radialGradient id="activeSegment" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#fbf7ff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#f3e8ff" stopOpacity="1" />
                  </radialGradient>
                </defs>
                {wheelSegments.map((factor) => {
                  const selected = selectedVariables.includes(factor.code);
                  return (
                    <path
                      key={factor.code}
                      className={`wheel-wedge ${selected ? "selected" : ""}`}
                      d={describeSegment(factor.startAngle, factor.endAngle)}
                      fill={`url(#${selected ? "activeSegment" : "inactiveSegment"})`}
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
                    onMouseEnter={() => setActiveInfo(factor.code)}
                    onMouseLeave={() => setActiveInfo(null)}
                  >
                    <button
                      className={`factor-segment segment-${index} ${selected ? "selected" : ""}`}
                      type="button"
                      onClick={() => toggleFactor(factor.code)}
                    >
                      <div className="factor-segment-core">
                        <Icon className="h-8 w-8" />
                        <span>
                          {predictionVariableLabels[factor.code]}
                          <span className="factor-info-icon"><Info className="h-3.5 w-3.5" /></span>
                        </span>
                      </div>
                      {selected ? (
                        <span className="factor-check">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : null}
                    </button>
                    {isActive && (
                      <div className={`factor-description-card tooltip-angle-${factor.centerAngle}`}>
                        <div className="factor-desc-header">
                          <Icon className="h-5 w-5" />
                          <h3>{predictionVariableLabels[factor.code]}</h3>
                        </div>
                        <p className="factor-desc-text">{factor.explanation}</p>
                        {factor.code === 'weight' && (
                          <p className="factor-desc-example">
                            e.g. A horse dropping 2.5kg from its last run (58kg → 55.5kg) after a narrow loss is often a strong positive.
                          </p>
                        )}
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
          <div className="bottom-selected-container light-pill-container">
            <span className="selected-container-title">SELECTED FACTORS <span className="text-purple-600">({selectedVariables.length}/3)</span></span>
            <div className="bottom-selected-bar">
              {selectedVariables.map(v => (
                <div key={v} className="selected-pill light-pill">
                  {predictionVariableLabels[v]}
                  <Check className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          <Button size="lg" className="prediction-cta solid-purple-btn" onClick={handleProceed} disabled={selectedVariables.length !== 3 || prediction.isPending}>
            <Sparkles className="h-5 w-5" /> {prediction.isPending ? "Running Prediction" : "Proceed to Predictions"}
          </Button>
        </div>
        {prediction.isError ? (
          <GlassCard className="p-4 text-center text-red-200">
            Prediction unavailable. The backend rejected or could not complete the request.
          </GlassCard>
        ) : null}
      </AsyncBoundary>
    </section>
  );
}
