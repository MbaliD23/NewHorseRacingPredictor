import React from "react";
import type { MetricAxis, NormalizedHorse } from "@/types/horseAnalytics";
import {
  CHART_SIZE,
  CENTER,
  RADIUS,
  RINGS,
  LABEL_GAP,
  HORSES,
  horseColor,
  computeScale,
  polarXY,
  anchorFor,
} from "@/lib/horseAnalytics";

interface RadarChartProps {
  activeHorseIds: number[];
  activeAxes: MetricAxis[];
  horses?: NormalizedHorse[];
}

export function RadarChart({ activeHorseIds, activeAxes, horses }: RadarChartProps) {
  const allHorses = horses && horses.length > 0 ? horses : HORSES;
  const n = activeAxes.length;

  if (n < 2) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          color: "#475569",
          fontSize: 13,
          fontFamily: "Outfit,Inter,sans-serif",
        }}
      >
        Select at least 2 metrics
      </div>
    );
  }

  if (activeHorseIds.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          color: "#475569",
          fontSize: 13,
          fontFamily: "Outfit,Inter,sans-serif",
        }}
      >
        Select up to 2 horses from the table below
      </div>
    );
  }

  const activeHorses = activeHorseIds
    .map((id) => allHorses.find((h) => h.id === id))
    .filter((h): h is NonNullable<typeof h> => Boolean(h));

  const scale = computeScale(activeHorses, activeAxes);

  // Ring radii: evenly spaced, outermost = full RADIUS
  const rings = scale.ticks.map((t) => (t / scale.max) * RADIUS);

  // Map a normalized value to a radius on the chart
  const valToR = (v: number) => (Math.min(v, scale.max) / scale.max) * RADIUS;

  const buildScaledPoints = (horse: (typeof activeHorses)[0]) =>
    activeAxes
      .map((ax, i) => {
        const deg = (i / n) * 360;
        const r = valToR(horse.norm[ax.key] ?? 0);
        const { x, y } = polarXY(deg, r);
        return `${x},${y}`;
      })
      .join(" ");

  const renderPolygon = (horse: (typeof activeHorses)[0], isTop: boolean) => {
    const color = horse.color ?? horseColor(horse.id);
    const filterId = `glow-${horse.id}`;
    const pts = buildScaledPoints(horse);
    const sw = isTop ? 2.5 : 2;

    return (
      <g key={horse.id}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={isTop ? 2.5 : 1.5} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Layer 1 – ultra-light fill only (no stroke), glow filter */}
        <polygon
          points={pts}
          fill={`${color}14`}
          stroke="none"
          filter={`url(#${filterId})`}
          style={{ transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)" }}
        >
          <title>{horse.name}</title>
        </polygon>

        {/* Layer 2 – stroke only, 30% brighter via CSS filter */}
        <polygon
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinejoin="round"
          style={{
            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
            filter: "brightness(1.3)",
            mixBlendMode: "screen",
          }}
        />

        {/* Vertex dots */}
        {activeAxes.map((ax, i) => {
          const deg = (i / n) * 360;
          const r = valToR(horse.norm[ax.key] ?? 0);
          const pt = polarXY(deg, r);
          const rawVal = (horse as unknown as Record<string, unknown>)[ax.key] ?? "";

          return (
            <g key={i} style={{ transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
              <circle cx={pt.x} cy={pt.y} r={5} fill={`${color}22`} />
              <circle cx={pt.x} cy={pt.y} r={3} fill={color} stroke="#121324" strokeWidth="1.2">
                <title>
                  {horse.name} – {ax.label}: {String(rawVal)}
                </title>
              </circle>
            </g>
          );
        })}
      </g>
    );
  };

  const SVG_PADDING_X = 90;
  const SVG_PADDING_Y = 80;

  return (
    <svg
      viewBox={`-${SVG_PADDING_X} -${SVG_PADDING_Y} ${CHART_SIZE + SVG_PADDING_X * 2} ${
        CHART_SIZE + SVG_PADDING_Y * 2
      }`}
      width="100%"
      height="100%"
      role="img"
      aria-label="Radar chart: horse benchmark comparison"
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        maxWidth: "490px",
        maxHeight: "440px",
        margin: "0 auto",
        overflow: "visible",
      }}
    >

      {/* Concentric rings */}
      {rings.map((r, i) => (
        <circle
          key={i}
          cx={CENTER}
          cy={CENTER}
          r={r}
          fill="none"
          stroke={i === RINGS - 1 ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.12)"}
          strokeWidth={i === RINGS - 1 ? 1.5 : 1}
          style={{ transition: "r 0.55s cubic-bezier(0.34, 1.05, 0.64, 1)" }}
        />
      ))}

      {/* Axis spokes */}
      {activeAxes.map((_, i) => {
        const outer = polarXY((i / n) * 360, RADIUS);
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(148,163,184,0.18)"
            strokeWidth="1"
          />
        );
      })}

      {/* Horse polygons */}
      {[...activeHorses].reverse().map((h, revIdx) => renderPolygon(h, revIdx === activeHorses.length - 1))}

      {/* Axis labels */}
      {activeAxes.map((ax, i) => {
        const deg = (i / n) * 360;
        const pt = polarXY(deg, RADIUS + LABEL_GAP);
        const anchor = anchorFor(deg);
        const lines = ax.label.split(" ");
        return (
          <text
            key={ax.key}
            x={pt.x}
            y={pt.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill="#F1F5F9"
            fontSize="17"
            fontFamily="Outfit,Inter,sans-serif"
            fontWeight="700"
            letterSpacing="0.2"
          >
            {lines.length === 1 ? (
              <tspan>{lines[0]}</tspan>
            ) : (
              lines.map((ln, li) => (
                <tspan key={li} x={pt.x} dy={li === 0 ? `-${(lines.length - 1) * 9}` : "18"}>
                  {ln}
                </tspan>
              ))
            )}
          </text>
        );
      })}

      {/* Ring tick labels */}
      {rings.map((r, i) => (
        <text
          key={i}
          x={CENTER + 6}
          y={CENTER - r + 4}
          fill="#FFFFFF"
          fontSize="10.4"
          fontWeight="700"
          fontFamily="Outfit,Inter,sans-serif"
          style={{
            transition: "y 0.55s cubic-bezier(0.34, 1.05, 0.64, 1)",
            textShadow: "0 1px 3px #000",
          }}
        >
          {Math.round(scale.ticks[i])}
        </text>
      ))}

      <circle cx={CENTER} cy={CENTER} r={3} fill="rgba(148,163,184,0.35)" />
    </svg>
  );
}
