import type { Horse } from "@/types/race";
import type {
  ChartScale,
  MetricAxis,
  NormalizedHorse,
  RawHorse,
  TableColumn,
} from "@/types/horseAnalytics";

/* ================================================================
   ALL AVAILABLE METRICS
   ================================================================ */
export const ALL_AXES: MetricAxis[] = [
  { key: "jockeyPerf", label: "Jockey Perf" },
  { key: "trainerPerf", label: "Trainer Perf" },
  { key: "totRns", label: "Tot Rns" },
  { key: "forecastOdds", label: "Forecast Odds" },
  { key: "crs", label: "Crs" },
  { key: "dst", label: "Dst" },
  { key: "cd", label: "C&D" },
  { key: "meritRating", label: "Merit Rating" },
];

/* ================================================================
   EXPANDED PALETTE & HORSE COLOR MAP
   ================================================================ */
export const PALETTE = [
  "#3B82F6", // 1: Blue
  "#EF4444", // 2: Red
  "#10B981", // 3: Emerald
  "#F59E0B", // 4: Amber
  "#8B5CF6", // 5: Purple
  "#EC4899", // 6: Pink
  "#06B6D4", // 7: Cyan
  "#F97316", // 8: Orange
  "#84CC16", // 9: Lime
  "#6366F1", // 10: Indigo
  "#14B8A6", // 11: Teal
  "#A855F7", // 12: Fuchsia
  "#EAB308", // 13: Yellow
  "#64748B", // 14: Slate
];

export const HORSE_COLORS: Record<number, string> = {
  1: "#3B82F6",
  2: "#EF4444",
  3: "#10B981",
  4: "#F59E0B",
  5: "#8B5CF6",
};

export function horseColor(idOrIndex: number, index?: number): string {
  if (index !== undefined && index >= 0) {
    return PALETTE[index % PALETTE.length];
  }
  if (HORSE_COLORS[idOrIndex]) {
    return HORSE_COLORS[idOrIndex];
  }
  const pos = Math.abs(Number(idOrIndex) || 1);
  return PALETTE[(pos - 1) % PALETTE.length];
}

/* ================================================================
   NORMALIZATION → 0–100
   ================================================================ */
export function parseRecord(str?: string): number {
  if (!str || str === "-" || str === "0:0-0-0") return 0;
  const [totStr, rest] = str.split(":");
  if (!rest) return 0;
  const total = parseInt(totStr, 10);
  const parts = rest.split("-").map((x) => parseInt(x, 10));
  const wins = parts[0] || 0;
  const seconds = parts[1] || 0;
  const thirds = parts[2] || 0;
  if (!total || isNaN(total)) return 0;
  const weightedScore = wins * 1.0 + seconds * 0.5 + thirds * 0.25;
  return Math.min(Math.max((weightedScore / total) * 100, 0), 100);
}

export function parseOdds(str?: string): number {
  if (!str || str === "-") return 50;
  const clean = str.trim().toLowerCase();
  if (clean === "evs" || clean === "even") return 50;
  const [numStr, denStr] = clean.split("/");
  const num = parseFloat(numStr);
  const den = denStr ? parseFloat(denStr) : 1;
  if (isNaN(num) || isNaN(den) || den === 0) return 50;
  const impliedProb = (1 / (num / den + 1)) * 100;
  return Math.min(Math.max(impliedProb, 2), 100);
}

export function normMerit(val: number): number {
  if (!val) return 0;
  return Math.min(Math.max(((val - 50) / 80) * 100, 5), 100);
}

export function parsePct(str?: string | number): number {
  if (str == null || str === "-") return 0;
  if (typeof str === "number") return Math.min(Math.max(str, 0), 100);
  const val = parseFloat(String(str).replace("%", "").trim());
  return isNaN(val) ? 0 : Math.min(Math.max(val, 0), 100);
}

export function extractPerformanceValue(
  directValue?: number | string | null,
  recordStr?: string | null,
  comboPercent?: number | string | null
): { display: string; normalized: number } {
  // 1. Direct numeric or percentage value from backend payload
  if (directValue != null && directValue !== "" && directValue !== "-") {
    if (typeof directValue === "number") {
      const clamped = Math.min(Math.max(directValue, 0), 100);
      return { display: `${Math.round(directValue)}%`, normalized: clamped };
    }
    const cleanStr = String(directValue).trim();
    const num = parseFloat(cleanStr.replace("%", ""));
    if (!isNaN(num)) {
      const clamped = Math.min(Math.max(num, 0), 100);
      return { display: `${Math.round(num)}%`, normalized: clamped };
    }
  }

  // 2. Parse from individual record string (e.g. "12:3-2-1", "3/12", or "18%")
  if (recordStr && recordStr !== "-" && recordStr !== "0:0-0-0") {
    const cleanStr = recordStr.trim();
    if (cleanStr.includes("%")) {
      const num = parseFloat(cleanStr.replace("%", ""));
      if (!isNaN(num)) {
        const clamped = Math.min(Math.max(num, 0), 100);
        return { display: `${Math.round(num)}%`, normalized: clamped };
      }
    }

    if (cleanStr.includes("/")) {
      const [wStr, tStr] = cleanStr.split("/");
      const wins = parseInt(wStr, 10);
      const total = parseInt(tStr, 10);
      if (!isNaN(wins) && !isNaN(total) && total > 0) {
        const winPct = Math.min(Math.max((wins / total) * 100, 0), 100);
        return { display: `${Math.round(winPct)}%`, normalized: winPct };
      }
    }

    if (cleanStr.includes(":")) {
      const [totStr, rest] = cleanStr.split(":");
      const total = parseInt(totStr, 10);
      if (!isNaN(total) && total > 0 && rest) {
        const parts = rest.split("-").map((x) => parseInt(x, 10));
        const wins = parts[0] || 0;
        const seconds = parts[1] || 0;
        const thirds = parts[2] || 0;
        const weightedScore = Math.min(Math.max(((wins * 1.0 + seconds * 0.5 + thirds * 0.25) / total) * 100, 0), 100);
        const winPct = Math.round((wins / total) * 100);
        return { display: `${winPct}%`, normalized: weightedScore };
      }
    }
  }

  // 3. Combo percentage fallback if individual record is absent
  if (comboPercent != null && comboPercent !== "" && comboPercent !== "-") {
    const num = typeof comboPercent === "number" ? comboPercent : parseFloat(String(comboPercent).replace("%", "").trim());
    if (!isNaN(num)) {
      const clamped = Math.min(Math.max(num, 0), 100);
      return { display: `${Math.round(num)}%`, normalized: clamped };
    }
  }

  return { display: "-", normalized: 0 };
}

/* ================================================================
   DYNAMIC BACKEND HORSE MAPPING
   ================================================================ */
export function mapBackendHorseToRaw(horse: Horse, index?: number): RawHorse {
  const idx = index !== undefined ? index : 0;
  const runnerNumber = horse.runner_number ?? horse.draw_number ?? (idx + 1);

  let totRns = horse.total_runs || "-";
  if (totRns === "-" && horse.form_entries && horse.form_entries.length > 0) {
    const wins = horse.form_entries.filter((f) => String(f.finish_position).trim() === "1").length;
    const seconds = horse.form_entries.filter((f) => String(f.finish_position).trim() === "2").length;
    const thirds = horse.form_entries.filter((f) => String(f.finish_position).trim() === "3").length;
    totRns = `${horse.form_entries.length}:${wins}-${seconds}-${thirds}`;
  }

  const forecastOdds = horse.odds || "-";
  const wet = horse.wet_record || "-";
  const crs = horse.course_record || "-";
  const dst = horse.distance_record || "-";
  const cd =
    horse.course_distance_record ||
    horse.course_distance ||
    horse.cd_record ||
    horse.c_and_d ||
    horse.candd_stat ||
    horse.course_and_distance ||
    "-";
  const meritRating = horse.merit_rating ?? (horse.previous_run_rating ? Math.round(horse.previous_run_rating * 10) : 70);

  const jockeyPerfData = extractPerformanceValue(
    horse.jockey_perf ?? horse.jockey_win_rate,
    horse.jockey_record,
    horse.trainer_jockey_win_percent
  );

  const trainerPerfData = extractPerformanceValue(
    horse.trainer_perf ?? horse.trainer_win_rate,
    horse.trainer_record,
    horse.trainer_jockey_win_percent
  );

  const jockeyPerf = jockeyPerfData.display;
  const trainerPerf = trainerPerfData.display;

  return {
    id: horse.id,
    name: horse.name,
    runnerNumber,
    color: horseColor(horse.id, index),
    totRns,
    forecastOdds,
    wet,
    crs,
    dst,
    cd,
    meritRating,
    jockeyPerf,
    trainerPerf,
  };
}

export function normaliseHorse(h: RawHorse): NormalizedHorse {
  return {
    ...h,
    norm: {
      totRns: parseRecord(h.totRns),
      forecastOdds: parseOdds(h.forecastOdds),
      crs: parseRecord(h.crs),
      dst: parseRecord(h.dst),
      cd: parseRecord(h.cd),
      meritRating: normMerit(h.meritRating),
      jockeyPerf: parsePct(h.jockeyPerf),
      trainerPerf: parsePct(h.trainerPerf),
    },
  };
}

export function mapBackendHorsesToNormalized(horses: Horse[]): NormalizedHorse[] {
  return horses.map((h, i) => normaliseHorse(mapBackendHorseToRaw(h, i)));
}

/* ================================================================
   FALLBACK STATIC DATA (used when no race is selected)
   ================================================================ */
export const HORSES_RAW: RawHorse[] = [
  {
    id: 1,
    name: "HEAT OF THE MOMENT",
    runnerNumber: 1,
    color: "#3B82F6",
    totRns: "21:6-3-3",
    forecastOdds: "3/1",
    wet: "4:1-0-1",
    crs: "21:6-3-3",
    dst: "14:4-2-1",
    cd: "3:1-0-1",
    meritRating: 112,
    jockeyPerf: "18%",
    trainerPerf: "14%",
  },
  {
    id: 2,
    name: "SILVER THUNDER",
    runnerNumber: 2,
    color: "#EF4444",
    totRns: "15:3-4-2",
    forecastOdds: "7/2",
    wet: "3:0-1-1",
    crs: "8:2-1-1",
    dst: "10:2-3-1",
    cd: "2:0-1-0",
    meritRating: 98,
    jockeyPerf: "22%",
    trainerPerf: "11%",
  },
  {
    id: 3,
    name: "NORTHERN STAR",
    runnerNumber: 3,
    color: "#10B981",
    totRns: "18:4-3-2",
    forecastOdds: "5/2",
    wet: "2:1-0-0",
    crs: "9:2-2-1",
    dst: "12:3-1-2",
    cd: "4:1-1-0",
    meritRating: 105,
    jockeyPerf: "15%",
    trainerPerf: "19%",
  },
  {
    id: 4,
    name: "DARK EMPRESS",
    runnerNumber: 4,
    color: "#F59E0B",
    totRns: "24:8-4-3",
    forecastOdds: "2/1",
    wet: "6:2-1-2",
    crs: "12:4-2-1",
    dst: "16:5-3-2",
    cd: "5:2-1-0",
    meritRating: 118,
    jockeyPerf: "26%",
    trainerPerf: "21%",
  },
  {
    id: 5,
    name: "GOLDEN ARROW",
    runnerNumber: 5,
    color: "#8B5CF6",
    totRns: "11:2-2-1",
    forecastOdds: "5/1",
    wet: "1:0-0-0",
    crs: "5:1-1-0",
    dst: "7:2-1-0",
    cd: "1:0-0-0",
    meritRating: 88,
    jockeyPerf: "12%",
    trainerPerf: "9%",
  },
];

export const HORSES: NormalizedHorse[] = HORSES_RAW.map(normaliseHorse);

/* ================================================================
   SVG GEOMETRY (Radar)
   ================================================================ */
export const CHART_SIZE = 708;
export const CENTER = CHART_SIZE / 2;
export const RADIUS = 283;
export const RINGS = 5;
export const LABEL_GAP = 52;

/* ================================================================
   DYNAMIC SCALE
   ================================================================ */
export function computeScale(horses: NormalizedHorse[], axes: MetricAxis[]): ChartScale {
  if (horses.length === 0 || axes.length === 0) {
    return { max: 100, ticks: [20, 40, 60, 80, 100] };
  }
  let vMax = 0;
  for (const horse of horses) {
    for (const ax of axes) {
      const v = horse.norm[ax.key] ?? 0;
      if (v > vMax) vMax = v;
    }
  }
  const bound = Math.min(Math.max(Math.ceil(vMax) + 5, 20), 100);
  const step = bound / RINGS;
  const ticks = Array.from({ length: RINGS }, (_, i) => +((i + 1) * step).toFixed(1));
  return { max: bound, ticks };
}

export function polarXY(angleDeg: number, r: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

export function buildPoints(normValues: number[], n: number): string {
  if (n < 2) return "";
  return normValues
    .map((v, i) => {
      const deg = (i / n) * 360;
      const r = (Math.min(v, 100) / 100) * RADIUS;
      const { x, y } = polarXY(deg, r);
      return `${x},${y}`;
    })
    .join(" ");
}

export function anchorFor(deg: number): "start" | "end" | "middle" {
  const d = ((deg % 360) + 360) % 360;
  if (d > 20 && d < 160) return "start";
  if (d > 200 && d < 340) return "end";
  return "middle";
}

/* ================================================================
   TABLE COLUMNS
   ================================================================ */
export const TABLE_COLS: TableColumn[] = [
  { key: "name", label: "Horse Name" },
  { key: "jockeyPerf", label: "Jockey Perf" },
  { key: "trainerPerf", label: "Trainer Perf" },
  { key: "totRns", label: "Tot Rns" },
  { key: "forecastOdds", label: "Forecast Odds" },
  { key: "wet", label: "Wet" },
  { key: "crs", label: "Crs" },
  { key: "dst", label: "Dst" },
  { key: "cd", label: "C&D" },
  { key: "meritRating", label: "Merit Rating" },
];

