import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./Analytics.module.css";
import type { MetricAxis, NormalizedHorse } from "@/types/horseAnalytics";
import { HORSES, horseColor, computeScale } from "@/lib/horseAnalytics";

interface BarChartProps {
  activeHorseIds: number[];
  activeAxes: MetricAxis[];
  horses?: NormalizedHorse[];
}

interface TooltipState {
  x: number;
  y: number;
  name: string;
  metric: string;
  raw: string | number;
  pct: number;
  color: string;
}

export function BarChart({ activeHorseIds, activeAxes, horses }: BarChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const allHorses = horses && horses.length > 0 ? horses : HORSES;

  const activeHorses = activeHorseIds
    .map((id) => allHorses.find((h) => h.id === id))
    .filter((h): h is NonNullable<typeof h> => Boolean(h));

  useEffect(() => {
    const handleScroll = () => setTooltip(null);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  if (activeHorses.length === 0 || activeAxes.length === 0) {
    return (
      <div className={styles.chartPlaceholder}>Select at least one horse from the table below</div>
    );
  }

  const scale = computeScale(activeHorses, activeAxes);

  // Y-axis tick labels (0 + scale.ticks)
  const yLabels = [0, ...scale.ticks];

  const handleBarHover = (
    e: React.MouseEvent<HTMLDivElement>,
    horse: NormalizedHorse,
    axLabel: string,
    rawVal: string,
    value: number,
    color: string
  ) => {
    setTooltip({
      x: e.clientX,
      y: e.clientY,
      name: horse.name,
      metric: axLabel,
      raw: rawVal,
      pct: Math.round(value),
      color,
    });
  };

  return (
    <div
      className={styles.barChartRoot}
      role="img"
      aria-label="Grouped bar chart: horse metric comparison"
    >
      <div className={styles.barChartBody}>
        {/* Y-axis labels */}
        <div className={styles.barYAxis}>
          {[...yLabels].reverse().map((mark) => (
            <div key={mark} className={styles.barYLabel}>
              {Math.round(mark)}
            </div>
          ))}
        </div>

        {/* Plot area */}
        <div className={styles.barPlotArea}>
          {/* Grid lines at each tick */}
          {yLabels.map((mark) => (
            <div
              key={mark}
              className={`${styles.barGridLine} ${mark === 0 ? styles.barGridLineBase : ""}`}
              style={{ bottom: `${(mark / scale.max) * 100}%` }}
            />
          ))}

          <div className={styles.barGroups}>
            {activeAxes.map((ax) => {
              const fixedMode = activeHorses.length <= 2;
              const FIXED_BAR_W = 30; // px per bar

              const horseValues = activeHorses.map((horse) => {
                const rawVal = (horse as unknown as Record<string, unknown>)[ax.key] ?? "";
                return {
                  horse,
                  value: horse.norm[ax.key] ?? 0,
                  color: horse.color ?? horseColor(horse.id),
                  rawVal: String(rawVal),
                };
              });

              return (
                <div key={ax.key} className={styles.barGroup}>
                  <div
                    className={styles.barGroupBars}
                    style={fixedMode ? { justifyContent: "center" } : {}}
                  >
                    {horseValues.map(({ horse, value, color, rawVal }) => {
                      const heightPct = Math.max((Math.min(value, scale.max) / scale.max) * 100, 1);
                      return (
                        <div
                          key={horse.id}
                          className={styles.barWrapper}
                          style={fixedMode ? { flex: "0 0 auto", width: FIXED_BAR_W } : {}}
                          onMouseEnter={(e) => handleBarHover(e, horse, ax.label, rawVal, value, color)}
                          onMouseMove={(e) => handleBarHover(e, horse, ax.label, rawVal, value, color)}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          <div
                            className={styles.bar}
                            style={{
                              height: `${heightPct}%`,
                              background: `linear-gradient(to top, ${color}bb, ${color})`,
                              boxShadow: `0 0 14px ${color}55`,
                            }}
                            title={`${horse.name}: ${rawVal} (${Math.round(value)})`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.barGroupLabel}>{ax.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {tooltip && typeof document !== "undefined" && createPortal(
        (() => {
          const TOOLTIP_HALF_WIDTH = 95;
          const margin = 12;
          const clampedX = Math.max(
            TOOLTIP_HALF_WIDTH + margin,
            Math.min(window.innerWidth - TOOLTIP_HALF_WIDTH - margin, tooltip.x)
          );

          const isFlipped = tooltip.y < 120;
          const topPos = isFlipped ? tooltip.y + 16 : tooltip.y - 12;
          const transform = isFlipped ? "translate(-50%, 0)" : "translate(-50%, -100%)";

          return (
            <div
              className={styles.chartTooltip}
              style={{
                left: clampedX,
                top: topPos,
                transform,
              }}
            >
              <div className={styles.chartTooltipHeader}>
                <span className={styles.chartTooltipSwatch} style={{ background: tooltip.color }} />
                <span className={styles.chartTooltipName}>{tooltip.name}</span>
              </div>
              <div className={styles.chartTooltipMetric}>{tooltip.metric}</div>
              <div className={styles.chartTooltipValue}>{tooltip.raw}</div>
              <div className={styles.chartTooltipPct}>
                {tooltip.pct} / {Math.round(scale.max)} (scaled)
              </div>
            </div>
          );
        })(),
        document.body
      )}
    </div>
  );
}
