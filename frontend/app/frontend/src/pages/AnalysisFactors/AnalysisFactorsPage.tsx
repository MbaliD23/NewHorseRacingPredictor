import { type CSSProperties, useMemo, useState } from "react";
import { BarChart3, Check, Clock, Gauge, Goal, Info, Scale, Sparkles, Trophy } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";
import { BackButton } from "@/components/navigation/BackButton";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { usePrediction } from "@/hooks/usePrediction";
import { useRace } from "@/hooks/useRace";
import { usePredictionStore } from "@/store/predictionStore";
import { predictionVariableLabels, type PredictionVariable } from "@/types/prediction";

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
  const { selectedVariables, setSelectedVariables, setCurrentRace, setPredictionResult } = usePredictionStore();
  const [showInfo, setShowInfo] = useState(false);
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
    <section className="page-section screen-shell analysis-page min-h-[calc(100vh-96px)]">
      <button
        className={`info-global info-orb ${showInfo ? "active" : ""}`}
        type="button"
        onClick={() => setShowInfo((value) => !value)}
        aria-label="Toggle factor information"
        aria-pressed={showInfo}
      >
        <Info className="h-5 w-5" />
      </button>
      <div className="page-heading page-heading-wide analysis-heading">
        <h1>
          Choose Your <span>Analysis Factors</span>
        </h1>
        <p>Select up to 3 factors to weight the prediction algorithm.</p>
      </div>

      <AsyncBoundary isLoading={isLoading} isError={isError} isEmpty={!race} emptyMessage="Race unavailable.">
        <div className="factor-layout">
          <div className={`factor-wheel ${showInfo ? "help-active" : ""}`}>
            <div className="wheel-glow" />
            <div className="wheel-ring wheel-ring-outer" />
            <div className="wheel-ring wheel-ring-inner" />
            <div className="wheel-tick-ring" />
            <svg className="factor-wheel-svg" viewBox="0 0 520 520" role="presentation" aria-hidden="true">
              <defs>
                <radialGradient id="inactiveSegment" cx="50%" cy="44%" r="68%">
                  <stop offset="0%" stopColor="#421071" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#17072c" stopOpacity="0.96" />
                </radialGradient>
                <radialGradient id="activeSegment" cx="38%" cy="38%" r="78%">
                  <stop offset="0%" stopColor="#196b84" stopOpacity="0.94" />
                  <stop offset="100%" stopColor="#092850" stopOpacity="0.98" />
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
              const Icon = factor.Icon;
              return (
                <button
                  key={factor.code}
                  className={`factor-segment segment-${index} ${selected ? "selected" : ""}`}
                  type="button"
                  style={labelPosition(factor.centerAngle)}
                  onClick={() => toggleFactor(factor.code)}
                >
                  <div className="factor-segment-core">
                    <Icon className="h-9 w-9" />
                    <span>
                      {predictionVariableLabels[factor.code]}
                      {showInfo ? (
                        <span
                          className="factor-info"
                          role="button"
                          tabIndex={0}
                          aria-label={`Show ${predictionVariableLabels[factor.code]} information`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveInfo(factor.code);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              setActiveInfo(factor.code);
                            }
                          }}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                    </span>
                  </div>
                  {selected ? (
                    <span className="factor-check">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="factor-side-panel">
            <GlassCard className="selected-panel selected-panel-side">
              <div className="selected-panel-header">
                <h2>Selected Factors</h2>
                <span>{selectedVariables.length}/3</span>
              </div>
              <div className="selected-factor-stack">
                {selectedVariables.length === 0 ? (
                  <p className="text-violet-100/60">Pick any factor on the circle to build your prediction mix.</p>
                ) : (
                  selectedVariables.map((variable) => (
                    <div className="selected-factor-card" key={variable}>
                      <span className="selected-chip">{predictionVariableLabels[variable]}</span>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            {showInfo ? (
              <GlassCard className="factor-explain">
                {activeFactor ? (
                  <>
                    <h2>{predictionVariableLabels[activeFactor.code]}</h2>
                    <p>{activeFactor.explanation}</p>
                  </>
                ) : (
                  <>
                    <h2>Factor Guide</h2>
                    <p>Tap any small info icon on the circle to read the description for that factor.</p>
                  </>
                )}
              </GlassCard>
            ) : null}
          </div>
        </div>

        <div className="page-actions">
          <BackButton label="Back" showLabel className="analysis-back" />
          <Button size="lg" className="prediction-cta" onClick={handleProceed} disabled={selectedVariables.length !== 3 || prediction.isPending}>
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
