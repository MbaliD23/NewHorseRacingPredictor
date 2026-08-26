import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Footprints,
  Glasses,
  Heart,
  Layers,
  ListFilter,
  Medal,
  MessageSquareText,
  Palette,
  PlayCircle,
  Scale,
  Tag,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { SilksRenderer } from "@/components/horse/SilksRenderer";
import { BackButton } from "@/components/navigation/BackButton";
import { usePredictionStore } from "@/store/predictionStore";
import { horseColor } from "@/lib/horseAnalytics";
import type { Horse, HorseFormEntry } from "@/types/race";

export type HorseViewMode = "single" | "split";

export interface HorseAnalysisViewProps {
  horse: Horse | null;
  raceTitle?: string;
  raceNumber?: number;
  raceDistance?: string | null;
  venueName?: string;
  horses?: Horse[];
  onSelectHorse?: (horse: Horse) => void;
  viewMode?: HorseViewMode;
  onViewModeChange?: (mode: HorseViewMode) => void;
}

type LabelValue = {
  label: string;
  value: string;
};

type ParsedPerformanceRecord = {
  totalRuns: number;
  wins: number;
  seconds: number;
  thirds: number;
  remainingRuns: number;
  isValid: boolean;
};

type FormColumnKey =
  | "weeks"
  | "date"
  | "track"
  | "ref"
  | "going"
  | "class"
  | "c_desc"
  | "distance"
  | "jockey"
  | "weight"
  | "mr"
  | "sh"
  | "draw"
  | "position"
  | "margin"
  | "winnerSecond"
  | "time"
  | "adjTime"
  | "open_odds"
  | "sp"
  | "pts"
  | "comment"
  | "formSummary";

type FormColumnDefinition = {
  key: FormColumnKey;
  label: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (entry: HorseFormEntry) => ReactNode;
};

const DISPLAY_DATE = new Date("2026-08-14T00:00:00");
const FORM_COLUMNS_STORAGE_KEY = "horse-form-visible-columns";

const CHART_COLORS = {
  wins: "#D4AF37",
  seconds: "#C0C0C0",
  thirds: "#CD7F32",
  remaining: "#7C3AED",
  empty: "#E5E7EB",
};

const FORM_COLUMNS: FormColumnDefinition[] = [
  {
    key: "weeks",
    label: "WEEKS",
    render: (entry) =>
      valueOrDash(
        entry.weeks
          ? `(${entry.weeks})`
          : entry.raw_date_text?.match(/\((\d+)\)/)?.[0] ?? null
      ),
  },
  {
    key: "date",
    label: "DATE",
    cellClassName: "font-semibold text-gray-900 dark:text-white whitespace-nowrap",
    render: (entry) => formatDate(entry.run_date, entry.raw_date_text),
  },
  { key: "track", label: "TRACK", render: (entry) => valueOrDash(entry.track) },
  { key: "ref", label: "REF", render: (entry) => valueOrDash(entry.ref_no ?? entry.race_number) },
  { key: "going", label: "GOING", render: (entry) => valueOrDash(entry.going ?? entry.track_condition) },
  { key: "class", label: "CLASS", render: (entry) => valueOrDash(entry.race_class ?? entry.class_of_race) },
  { key: "c_desc", label: "C_DESC", render: (entry) => valueOrDash(entry.course_desc ?? entry.c_desc) },
  { key: "distance", label: "DISTANCE", render: (entry) => valueOrDash(entry.distance) },
  { key: "jockey", label: "JOCKEY", cellClassName: "whitespace-nowrap", render: (entry) => valueOrDash(entry.jockey_name) },
  { key: "weight", label: "WGT", render: (entry) => valueOrDash(entry.weight) },
  {
    key: "mr",
    label: "MR",
    render: (entry) => {
      const mr = entry.merit_rating ?? entry.mr;
      if (mr && String(mr).trim() !== "" && String(mr).trim() !== "-") {
        const clean = String(mr).replace(/[()]/g, "").trim();
        return clean ? `(${clean})` : "-";
      }
      return "-";
    },
  },
  { key: "sh", label: "SH", render: (entry) => valueOrDash(entry.shoeing) },
  { key: "draw", label: "DRAW", render: (entry) => valueOrDash(entry.draw) },
  {
    key: "position",
    label: "POS",
    render: (entry) => {
      if (
        entry.finish_position === null ||
        entry.finish_position === undefined ||
        isNaN(Number(entry.finish_position)) ||
        Number(entry.finish_position) <= 0
      ) {
        return "-";
      }
      return (
        <span
          className={`inline-flex min-w-9 items-center justify-center rounded-lg border px-2.5 py-1 font-bold ${getFormBadgeTone(entry.finish_position)}`}
        >
          {entry.finish_position}
        </span>
      );
    },
  },
  { key: "margin", label: "MARGIN", render: (entry) => valueOrDash(entry.margin_behind_winner) },
  {
    key: "winnerSecond",
    label: "WINNER/2ND",
    cellClassName: "font-medium whitespace-nowrap",
    render: (entry) => {
      if (!entry.winner_name || String(entry.winner_name).trim() === "" || entry.winner_name === "-") return "-";
      const w = entry.winner_name.trim();
      const wt = entry.winner_weight ? String(entry.winner_weight).trim() : "";
      return wt && wt !== "-" ? `${w} ${wt}` : w;
    },
  },
  { key: "time", label: "TIME", render: (entry) => valueOrDash(entry.time) },
  { key: "adjTime", label: "ADJ/TM", render: (entry) => valueOrDash(entry.adjusted_time ?? entry.speed_figure) },
  { key: "open_odds", label: "OPEN_ODDS", render: (entry) => valueOrDash(entry.open_odds ?? entry.opening_bet) },
  { key: "sp", label: "SP", render: (entry) => valueOrDash(entry.starting_price ?? entry.sp) },
  { key: "pts", label: "PTS", render: (entry) => valueOrDash(entry.pts ?? entry.actual_rating ?? entry.rating) },
  { key: "comment", label: "COMMENT", render: (entry) => valueOrDash(entry.comment) },
];

const DEFAULT_FORM_COLUMN_KEYS: FormColumnKey[] = [
  "weeks",
  "date",
  "track",
  "ref",
  "going",
  "class",
  "c_desc",
  "distance",
  "jockey",
  "weight",
  "mr",
  "sh",
  "draw",
  "position",
  "margin",
  "winnerSecond",
  "time",
  "adjTime",
  "open_odds",
  "sp",
  "pts",
  "comment",
];

const FORM_COLUMN_KEYS = new Set<FormColumnKey>(FORM_COLUMNS.map((column) => column.key));

const COLOR_LABELS: Record<string, string> = {
  b: "Bay",
  br: "Brown",
  ch: "Chestnut",
  gr: "Grey",
  g: "Grey",
  blk: "Black",
};

const SEX_LABELS: Record<string, string> = {
  c: "Colt",
  f: "Filly",
  g: "Gelding",
  m: "Mare",
  h: "Horse",
  bg: "b.g.",
  bf: "b.f.",
  bc: "b.c.",
  brg: "br.g.",
  brf: "br.f.",
  chg: "ch.g.",
  chf: "ch.f.",
  grg: "gr.g.",
  grf: "gr.f.",
};

function valueOrDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "number") {
    if (isNaN(value)) return "-";
    return String(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      trimmed.length === 0 ||
      trimmed === "null" ||
      trimmed === "undefined" ||
      trimmed === "NaN"
    ) {
      return "-";
    }
    return trimmed;
  }

  return String(value);
}

function parseDob(dob: string | null | undefined) {
  if (!dob) {
    return null;
  }

  const parsed = new Date(dob);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getAgeLabel(dob: string | null | undefined) {
  const parsed = parseDob(dob);
  if (!parsed) {
    return "-";
  }

  const age = DISPLAY_DATE.getFullYear() - parsed.getFullYear();
  return age >= 0 ? `${age} y.o.` : "-";
}

function parseProfileSummary(summary: string | null | undefined) {
  if (!summary) {
    return { sex: "-", colour: "-" };
  }

  const normalized = summary
    .toLowerCase()
    .replace(/^\d+\s*y\.?o\.?\s*/i, "")
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return { sex: "-", colour: "-" };
  }

  const parts = normalized.split(" ");
  const colourCode = parts[0];
  const colour = COLOR_LABELS[colourCode] ?? "-";
  const sexTokens = parts.slice(colour === "-" ? 0 : 1);
  const sexKey = sexTokens.join("");
  const sex = SEX_LABELS[sexKey] ?? valueOrDash(sexTokens.join("."));

  return { sex, colour };
}

function parsePedigreeLine(line: string | null | undefined) {
  if (!line) {
    return { sire: "-", dam: "-", damSire: "-", summary: "-" };
  }

  const cleaned = line.replace(/\.$/, "").trim();
  const match = cleaned.match(/^(.*?)\s*-\s*(.*?)\s+by\s+(.*?)$/i);

  if (!match) {
    return {
      sire: "-",
      dam: "-",
      damSire: "-",
      summary: cleaned,
    };
  }

  return {
    sire: valueOrDash(match[1].trim()),
    dam: valueOrDash(match[2].trim()),
    damSire: valueOrDash(match[3].trim()),
    summary: cleaned,
  };
}

function parseRunsRecord(record: string | null | undefined) {
  if (!record) {
    return {
      runs: "-",
      wins: "-",
      seconds: "-",
      thirds: "-",
      places: "-",
      winPercent: "-",
    };
  }

  const match = record.match(/^(\d+):(\d+)-(\d+)-(\d+)$/);
  if (!match) {
    return {
      runs: valueOrDash(record),
      wins: "-",
      seconds: "-",
      thirds: "-",
      places: "-",
      winPercent: "-",
    };
  }

  const runs = Number(match[1]);
  const wins = Number(match[2]);
  const seconds = Number(match[3]);
  const thirds = Number(match[4]);
  const places = seconds + thirds;
  const winPercent = runs > 0 ? `${Math.round((wins / runs) * 100)}%` : "-";

  return {
    runs: String(runs),
    wins: String(wins),
    seconds: String(seconds),
    thirds: String(thirds),
    places: String(places),
    winPercent,
  };
}

function parsePerformanceRecord(record: string | null | undefined): ParsedPerformanceRecord {
  if (!record) {
    return {
      totalRuns: 0,
      wins: 0,
      seconds: 0,
      thirds: 0,
      remainingRuns: 0,
      isValid: false,
    };
  }

  const matchColon = record.trim().match(/^(\d+)\s*:\s*(\d+)-(\d+)-(\d+)$/);
  if (matchColon) {
    const totalRuns = Number(matchColon[1]);
    const wins = Number(matchColon[2]);
    const seconds = Number(matchColon[3]);
    const thirds = Number(matchColon[4]);
    const remainingRuns = Math.max(totalRuns - wins - seconds - thirds, 0);

    return {
      totalRuns,
      wins,
      seconds,
      thirds,
      remainingRuns,
      isValid: totalRuns > 0,
    };
  }

  const matchSlash = record.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  if (matchSlash) {
    const wins = Number(matchSlash[1]);
    const totalRuns = Number(matchSlash[2]);
    return {
      totalRuns,
      wins,
      seconds: 0,
      thirds: 0,
      remainingRuns: Math.max(totalRuns - wins, 0),
      isValid: totalRuns > 0,
    };
  }

  return {
    totalRuns: 0,
    wins: 0,
    seconds: 0,
    thirds: 0,
    remainingRuns: 0,
    isValid: false,
  };
}

function loadStoredFormColumns(): FormColumnKey[] {
  if (typeof window === "undefined") {
    return DEFAULT_FORM_COLUMN_KEYS;
  }

  try {
    const stored = window.localStorage.getItem(FORM_COLUMNS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    if (!Array.isArray(parsed)) {
      return DEFAULT_FORM_COLUMN_KEYS;
    }

    const mapped = parsed.map((k) =>
      k === "winner"
        ? "winnerSecond"
        : k === "raceNumber"
          ? "ref"
          : k === "speedFigure"
            ? "adjTime"
            : k === "rating" || k === "ar"
              ? "pts"
              : k === "ob"
                ? "open_odds"
                : k
    );
    const validKeys = mapped.filter((key): key is FormColumnKey => FORM_COLUMN_KEYS.has(key));
    const validKeySet = new Set(validKeys);
    if (!validKeySet.has("c_desc") || !validKeySet.has("weeks") || !validKeySet.has("open_odds")) {
      return DEFAULT_FORM_COLUMN_KEYS;
    }
    return validKeys.length > 0 ? validKeys : DEFAULT_FORM_COLUMN_KEYS;
  } catch {
    return DEFAULT_FORM_COLUMN_KEYS;
  }
}

function parseIsoDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: string | null | undefined, fallback?: string | null) {
  const parsed = parseIsoDate(value);
  if (!parsed) {
    return valueOrDash(fallback ?? value);
  }

  return parsed.toISOString().slice(0, 10);
}

function getBestMeritRating(entries: HorseFormEntry[], fallback: number | null | undefined) {
  const ratings = entries
    .map((entry) => {
      const mr = entry.merit_rating ?? entry.mr;
      if (!mr || mr === "-") return NaN;
      const clean = String(mr).replace(/[()]/g, "").trim();
      const num = Number(clean);
      return Number.isFinite(num) && num > 0 ? num : NaN;
    })
    .filter((value) => Number.isFinite(value));

  if (ratings.length > 0) {
    return String(Math.max(...ratings));
  }

  return valueOrDash(fallback);
}

function getDaysSinceLastWin(entries: HorseFormEntry[]) {
  const latestWin = entries.find((entry) => entry.finish_position === 1);
  const winDate = parseIsoDate(latestWin?.run_date);
  if (!winDate) {
    return "-";
  }

  const diffMs = DISPLAY_DATE.getTime() - winDate.getTime();
  if (diffMs < 0) {
    return "-";
  }

  return `${Math.floor(diffMs / (1000 * 60 * 60 * 24))} days`;
}

function getFormBadgeTone(position: number | null | undefined) {
  if (position === 1) {
    return "border-emerald-200 bg-emerald-500 text-white";
  }

  if (position === 2) {
    return "border-lime-200 bg-lime-400 text-lime-950";
  }

  if (position === 3) {
    return "border-yellow-200 bg-yellow-300 text-yellow-950";
  }

  if (position && position <= 6) {
    return "border-orange-200 bg-orange-300 text-orange-950";
  }

  if (position && position >= 7) {
    return "border-red-200 bg-red-400 text-white";
  }

  return "border-gray-200 bg-gray-50 text-gray-600";
}

function buildFormSummary(horse: Horse | null) {
  const entries = [...(horse?.form_entries ?? [])].sort((left, right) => {
    const leftDate = parseIsoDate(left.run_date)?.getTime() ?? 0;
    const rightDate = parseIsoDate(right.run_date)?.getTime() ?? 0;
    return rightDate - leftDate;
  });
  const runStats = parseRunsRecord(horse?.total_runs);

  return {
    entries,
    totalRuns: runStats.runs,
    wins: runStats.wins,
    places: runStats.places,
    winPercent: runStats.winPercent,
    bestMeritRating: getBestMeritRating(entries, horse?.merit_rating),
    daysSinceLastWin: getDaysSinceLastWin(entries),
    recentStrip: entries.slice(0, 5),
  };
}

export function HorseAnalysisView({
  horse,
  raceTitle,
  raceNumber,
  raceDistance,
  venueName,
  horses,
  onSelectHorse,
  viewMode = "single",
  onViewModeChange,
}: HorseAnalysisViewProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRace, setCurrentHorse } = usePredictionStore();
  const [showFormHistory, setShowFormHistory] = useState(false);
  const [visibleFormColumnKeys, setVisibleFormColumnKeys] = useState<FormColumnKey[]>(
    loadStoredFormColumns,
  );

  const handleWatchVideo = () => {
    if (horse) setCurrentHorse(horse);
    const isPredictionFlow = location.pathname.startsWith("/predictions");
    const targetPath = isPredictionFlow
      ? `/predictions/horses/${horse?.id ?? ""}/replay`
      : `/horses/${horse?.id ?? ""}/replay`;
    navigate(targetPath);
  };

  const [profilePage, setProfilePage] = useState(0);
  const profileScrollRef = useRef<HTMLDivElement>(null);

  const horseList = horses && horses.length > 0 ? horses : [];
  const currentIndex = horse ? horseList.findIndex((h) => String(h.id) === String(horse.id)) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < horseList.length - 1;

  const assignedColor = useMemo(() => {
    if (!horse) return "#6A2DF1";
    if (currentIndex >= 0) {
      return horseColor(horse.id, currentIndex);
    }
    if (horse.runner_number !== undefined && horse.runner_number !== null) {
      return horseColor(horse.runner_number);
    }
    return horseColor(horse.id);
  }, [horse, currentIndex]);

  const handlePrev = () => {
    if (hasPrev && onSelectHorse) {
      onSelectHorse(horseList[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectHorse) {
      onSelectHorse(horseList[currentIndex + 1]);
    }
  };

  useEffect(() => {
    window.localStorage.setItem(
      FORM_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleFormColumnKeys),
    );
  }, [visibleFormColumnKeys]);

  const goToProfilePage = (page: number) => {
    const container = profileScrollRef.current;

    if (!container) return;

    container.scrollTo({
      left: container.clientWidth * page,
      behavior: "smooth",
    });

    setProfilePage(page);
  };

  const horseName = horse?.name ?? "Unknown horse";
  const saddleNo = horse?.runner_number ?? "-";
  const jockeyName = horse?.jockey_name ?? "-";
  const trainerName = horse?.trainer_name ?? "-";

  const { sex, colour } = useMemo(
    () => parseProfileSummary(horse?.pedigree_description),
    [horse?.pedigree_description],
  );
  const { sire, dam, damSire } = useMemo(
    () => parsePedigreeLine(horse?.pedigree_line),
    [horse?.pedigree_line],
  );
  const runStats = useMemo(() => parseRunsRecord(horse?.total_runs), [horse?.total_runs]);
  const formSummary = useMemo(() => buildFormSummary(horse), [horse]);
  // Winning Form supplies the summary as source data. Never synthesize a comment:
  // use the newest non-empty scraped summary, otherwise show an explicit unavailable state.
  const winningFormSummary = useMemo(
    () =>
      formSummary.entries
        .map((entry) => entry.form_summary?.trim())
        .find((summary): summary is string => Boolean(summary)),
    [formSummary.entries],
  );
  const parsedWinningFormSummary = useMemo(() => {
    if (!winningFormSummary) return null;

    let remaining = winningFormSummary.trim();

    // Extract "Placed: G14,G14,D12(35 wks)"
    const placedMatch = remaining.match(
      /Placed:\s*([^.(]+(?:,[^.(]+)*)\s*(?:\((\d+)\s*wks?\))?\.?/i,
    );

    const recentPlacings = placedMatch?.[1]
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const weeksSinceRun = placedMatch?.[2];

    if (placedMatch) {
      remaining = remaining.replace(placedMatch[0], "").trim();
    }

    // Extract "Ex Smith D-2026.06.08"
    const exTrainerMatch = remaining.match(
      /Ex\s+(.+?)-\d{4}\.\d{2}\.\d{2}\.?/i,
    );

    const previousTrainer = exTrainerMatch?.[1]?.trim();

    if (exTrainerMatch) {
      remaining = remaining.replace(exTrainerMatch[0], "").trim();
    }

    // Extract "Best MR:75"
    const meritMatch = remaining.match(/Best MR:\s*(\d+)/i);
    const bestMR = meritMatch?.[1];

    if (meritMatch) {
      remaining = remaining.replace(meritMatch[0], "").trim();
    }

    // Clean punctuation left behind after extracting factual fields.
    const comment = remaining
      .replace(/^\s*[.,;:-]+\s*/, "")
      .replace(/\s+/g, " ")
      .trim();

    return {
      recentPlacings,
      weeksSinceRun,
      previousTrainer,
      bestMR,
      comment: comment || undefined,
    };
  }, [winningFormSummary]);
  const visibleFormEntries = showFormHistory
    ? formSummary.entries
    : formSummary.entries.slice(0, 5);
  const visibleFormColumns = useMemo(
    () =>
      visibleFormColumnKeys
        .map((key) => FORM_COLUMNS.find((column) => column.key === key))
        .filter((column): column is FormColumnDefinition => Boolean(column)),
    [visibleFormColumnKeys],
  );

  const profileRows: LabelValue[] = [
    { label: "Age", value: getAgeLabel(horse?.dob) },
    { label: "Sex", value: sex },
    { label: "Owner", value: valueOrDash(horse?.owner) },
    { label: "Breeder", value: valueOrDash(horse?.breeder) },
  ];

  const pedigreeRows: LabelValue[] = [
    { label: "Colour", value: colour },
    { label: "Sire", value: sire },
    { label: "Dam", value: dam },
    { label: "Dam Sire", value: damSire },
  ];

  const technicalRows: LabelValue[] = [
    {
      label: "Weight",
      value:
        horse?.weight_value !== null && horse?.weight_value !== undefined
          ? `${horse.weight_value.toFixed(1)} kg`
          : "-",
    },
    { label: "Blinkers", value: horse?.equipment?.includes("B") ? "Yes" : "No" },
    { label: "Alumites", value: horse?.equipment?.includes("A") ? "Yes" : "No" },
    { label: "Stakes", value: valueOrDash(horse?.stakes) },
    { label: "Sale Price", value: valueOrDash(horse?.sale_price) },
  ];

  const canddRecord =
    horse?.course_distance_record ??
    horse?.course_distance ??
    horse?.cd_record ??
    horse?.c_and_d ??
    horse?.candd_stat ??
    horse?.course_and_distance ??
    null;

  const recordCharts = [
    { label: "Record", record: horse?.total_runs },
    { label: "Wet", record: horse?.wet_record },
    { label: "Course", record: horse?.course_record },
    { label: "Distance", record: horse?.distance_record },
    { label: "Course & Distance", record: canddRecord },
  ];

  return (
    <div className="w-full text-gray-800 dark:text-slate-200 p-1 sm:p-1.5 transition-all duration-300 ease-in-out">
      <div className="space-y-4 sm:space-y-5 rounded-3xl border border-purple-100/80 dark:border-slate-800/80 bg-white dark:bg-[#121324] p-[clamp(0.875rem,1.8vw,1.5rem)] shadow-[0_10px_40px_rgba(139,92,246,0.06)] dark:shadow-none transition-all duration-300 ease-in-out">
        {/* Header Control Bar */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-purple-100/70 dark:border-slate-800/70">
          <BackButton
            to={horse?.race_id ? `/races/${horse.race_id}` : currentRace?.id ? `/races/${currentRace.id}` : "/"}
            fallbackTo={horse?.race_id ? `/races/${horse.race_id}` : currentRace?.id ? `/races/${currentRace.id}` : "/"}
            label="Back to Horses"
          />

          {/* Right Action Controls: Horse Display & Head to Head Comparison */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleWatchVideo}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 transition-all font-semibold text-xs sm:text-sm shadow-md cursor-pointer active:scale-95"
              title="Horse display"
              aria-label="Horse display"
            >
              <PlayCircle className="h-4 w-4 shrink-0 text-purple-300 group-hover:text-white" />
              <span>Horse display</span>
            </button>

            {onViewModeChange && (
              <button
                type="button"
                onClick={() => onViewModeChange(viewMode === "single" ? "split" : "single")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold backdrop-blur-sm transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${viewMode === "split"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400"
                  : "bg-purple-950/50 border border-purple-800/40 hover:bg-purple-800/50 text-white shadow-xs"
                  }`}
                title={viewMode === "split" ? "Close Radar Chart (Return to Full Width)" : "Open Head to Head Radar Chart (50/50 Split)"}
                aria-label="Toggle Head to Head Radar View"
                aria-pressed={viewMode === "split"}
              >
                <Zap className={`h-4 w-4 shrink-0 ${viewMode === "split" ? "text-white" : "text-purple-300 group-hover:text-white"}`} />
                <span>Head to Head Comparison</span>
              </button>
            )}
          </div>
        </div>

        {/* Horse Identity Banner: Row 2 (Number Badge + Name with Nav Arrows + Metadata) */}
        <div className="flex items-center gap-3.5 min-w-0 w-full pt-0.5">
          <span
            className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 aspect-square items-center justify-center rounded-xl text-lg sm:text-xl font-bold text-white transition-all duration-300"
            style={{
              backgroundColor: assignedColor,
              boxShadow: `0 0 14px ${assignedColor}55`,
              border: `1px solid ${assignedColor}88`,
            }}
          >
            {saddleNo}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[clamp(1.2rem,2.2vw,1.75rem)] font-black uppercase tracking-tight text-gray-900 dark:text-white break-words leading-tight">
                {horseName}
              </h1>

              {/* Paired Previous / Next Horse Arrow Navigation */}
              {horseList.length > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={!hasPrev}
                    aria-label="Previous Horse"
                    title={hasPrev ? `Previous: ${horseList[currentIndex - 1].name}` : "First horse in race"}
                    className={`w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-xl transition-all ${hasPrev
                      ? "bg-purple-950/50 border border-purple-800/40 hover:bg-purple-800/50 text-white shadow-xs active:scale-95 cursor-pointer"
                      : "bg-purple-950/20 border border-purple-900/20 text-purple-300/40 opacity-30 pointer-events-none cursor-not-allowed"
                      }`}
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!hasNext}
                    aria-label="Next Horse"
                    title={hasNext ? `Next: ${horseList[currentIndex + 1].name}` : "Last horse in race"}
                    className={`w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-xl transition-all ${hasNext
                      ? "bg-purple-950/50 border border-purple-800/40 hover:bg-purple-800/50 text-white shadow-xs active:scale-95 cursor-pointer"
                      : "bg-purple-950/20 border border-purple-900/20 text-purple-300/40 opacity-30 pointer-events-none cursor-not-allowed"
                      }`}
                  >
                    <ChevronRight className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </button>
                </div>
              )}
            </div>

            {raceTitle ? (
              <p className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-400 truncate mt-0.5">
                {venueName ? `${venueName} • ` : ""}
                Race {raceNumber ? `${raceNumber}: ` : ""}
                {raceTitle}
              </p>
            ) : null}

            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300">
              <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 text-purple-900 dark:text-purple-300 font-bold border border-purple-100 dark:border-purple-800/60">
                Draw: {valueOrDash(horse?.draw_number)}
              </span>
              <span className="inline-flex items-center rounded-md bg-gray-50 dark:bg-slate-800 px-2 py-0.5 text-gray-700 dark:text-slate-300 font-bold border border-gray-200 dark:border-slate-700">
                Distance: {valueOrDash(raceDistance)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile & Jockey Colours */}
        <div className={`grid gap-[clamp(0.75rem,1.5vw,1.25rem)] ${viewMode === "single" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 xl:grid-cols-2"}`}>
          <SectionCard icon={User} title="Horse Profile">
            {/* SCROLLABLE PAGES */}
            <div
              ref={profileScrollRef}
              onScroll={(event) => {
                const container = event.currentTarget;

                if (container.clientWidth === 0) return;

                const page = Math.round(
                  container.scrollLeft / container.clientWidth
                );

                setProfilePage(page);
              }}
              className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {/* PAGE 1 */}
              <div className="w-full shrink-0 snap-start">
                <DetailsGrid rows={profileRows} />
              </div>

              {/* PAGE 2 */}
              <div className="w-full shrink-0 snap-start">
                <DetailsGrid rows={pedigreeRows} />
              </div>
            </div>

            {/* PAGE DOTS */}
            <div className="flex items-center justify-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => goToProfilePage(0)}
                aria-label="Show horse profile"
                className={`h-2.5 w-2.5 shrink-0 aspect-square rounded-full transition-all ${profilePage === 0
                  ? "bg-purple-700 dark:bg-purple-500 scale-110"
                  : "bg-gray-300 dark:bg-slate-700 hover:bg-purple-300 dark:hover:bg-purple-800"
                  }`}
              />

              <button
                type="button"
                onClick={() => goToProfilePage(1)}
                aria-label="Show horse pedigree"
                className={`h-2.5 w-2.5 shrink-0 aspect-square rounded-full transition-all ${profilePage === 1
                  ? "bg-purple-700 dark:bg-purple-500 scale-110"
                  : "bg-gray-300 dark:bg-slate-700 hover:bg-purple-300 dark:hover:bg-purple-800"
                  }`}
              />
            </div>
          </SectionCard>

          <SectionCard icon={Palette} title="Jockey Colours">
            <div className="flex flex-col items-center justify-center h-full gap-3 min-w-0 w-full text-center py-1">
              <div className="flex justify-center shrink-0 aspect-square">
                <SilksRenderer
                  description={horse?.silks}
                  className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 aspect-square"
                />
              </div>

              <div className="w-full max-w-full flex flex-col items-center justify-center gap-1 text-center px-1">
                <p className="w-full rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/70 dark:bg-purple-950/40 px-3 py-2 text-xs leading-relaxed text-purple-950 dark:text-purple-200 font-medium text-center break-words overflow-hidden">
                  {horse?.silks?.trim() ? horse.silks : "Colours not available"}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Winning Form Summary - source data only; never generated or inferred */}
        <SectionCard icon={MessageSquareText} title="Form Summary">
          {parsedWinningFormSummary ? (
            <div className="rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/70 dark:bg-purple-950/30 px-4 py-4 sm:px-5 sm:py-5">

              {parsedWinningFormSummary.comment && (
                <p className="text-sm sm:text-base font-semibold leading-relaxed text-gray-900 dark:text-slate-100">
                  {parsedWinningFormSummary.comment}
                </p>
              )}

              {(parsedWinningFormSummary.recentPlacings?.length ||
                parsedWinningFormSummary.weeksSinceRun ||
                parsedWinningFormSummary.previousTrainer) && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs sm:text-sm">

                    {parsedWinningFormSummary.recentPlacings?.length ? (
                      <div>
                        <span className="text-gray-500 dark:text-slate-400">
                          Recent:
                        </span>{" "}
                        <span className="font-semibold text-gray-900 dark:text-slate-100">
                          {parsedWinningFormSummary.recentPlacings.join(" • ")}
                        </span>
                      </div>
                    ) : null}

                    {parsedWinningFormSummary.weeksSinceRun ? (
                      <div>
                        <span className="text-gray-500 dark:text-slate-400">
                          Last raced:
                        </span>{" "}
                        <span className="font-semibold text-gray-900 dark:text-slate-100">
                          {parsedWinningFormSummary.weeksSinceRun} weeks ago
                        </span>
                      </div>
                    ) : null}

                    {parsedWinningFormSummary.previousTrainer ? (
                      <div>
                        <span className="text-gray-500 dark:text-slate-400">
                          Previous trainer:
                        </span>{" "}
                        <span className="font-semibold text-gray-900 dark:text-slate-100">
                          {parsedWinningFormSummary.previousTrainer}
                        </span>
                      </div>
                    ) : null}

                  </div>
                )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40 px-4 py-4 sm:px-5">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Form summary not available.
              </p>
            </div>
          )}
        </SectionCard>

        {/* The Team */}
        <div className="grid gap-4">
          <SectionCard icon={User} title="The Team">
            <div className="grid gap-4 sm:grid-cols-2">
              <TeamPerformanceChart
                role="Jockey"
                name={jockeyName}
                record={horse?.jockey_record}
              />
              <TeamPerformanceChart
                role="Trainer"
                name={trainerName}
                record={horse?.trainer_record}
              />
            </div>
          </SectionCard>
        </div>

        {/* Record Breakdown */}
        <SectionCard icon={Trophy} title="Record Breakdown">
          <div className="space-y-4 sm:space-y-5">
            <ChartLegend />
            <div className={`grid gap-[clamp(0.5rem,1vw,0.75rem)] ${viewMode === "single" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"}`}>
              {recordCharts.map((chart) => (
                <RecordPieChart
                  key={chart.label}
                  label={chart.label}
                  record={chart.record}
                />
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Technical Details */}
        <SectionCard icon={Tag} title="Technical Details">
          <div className={`grid gap-[clamp(0.5rem,1vw,0.75rem)] ${viewMode === "single" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" : "grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5"}`}>
            <MetricTile icon={Scale} label="Weight" value={technicalRows[0].value} />
            <MetricTile icon={Glasses} label="Blinkers" value={technicalRows[1].value} />
            <MetricTile icon={Footprints} label="Alumites" value={technicalRows[2].value} />
            <MetricTile icon={Trophy} label="Stakes" value={technicalRows[3].value} />
            <MetricTile icon={Tag} label="Sale Price" value={technicalRows[4].value} />
          </div>
        </SectionCard>

        {/* Recent Form */}
        <SectionCard icon={Trophy} title="Recent Form">
          <div className="space-y-4 sm:space-y-5">
            <div className={`grid gap-[clamp(0.5rem,1vw,0.75rem)] ${viewMode === "single" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7" : "grid-cols-2 sm:grid-cols-2 xl:grid-cols-3"}`}>
              <MetricTile icon={Medal} label="Merit Rating" value={valueOrDash(horse?.merit_rating)} />
              <MetricTile
                icon={Medal}
                label="Best Merit Rating"
                value={formSummary.bestMeritRating}
              />
              <MetricTile icon={Layers} label="Total Runs" value={formSummary.totalRuns} />
              <MetricTile icon={Trophy} label="Wins" value={formSummary.wins} />
              <MetricTile icon={Medal} label="Places" value={formSummary.places} />
              <MetricTile icon={Tag} label="Win %" value={formSummary.winPercent} />
              <MetricTile
                icon={Layers}
                label="Days Since Last Win"
                value={formSummary.daysSinceLastWin}
              />
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">
                Form Strip
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {formSummary.recentStrip.length > 0 ? (
                  formSummary.recentStrip.map((entry, index) => (
                    <span
                      key={`${entry.run_date ?? "unknown"}-${index}`}
                      className={`inline-flex min-w-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-extrabold ${getFormBadgeTone(entry.finish_position)}`}
                    >
                      {valueOrDash(entry.finish_position)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    No recent form history available.
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                {showFormHistory ? "Full form history" : "Last 5 races"}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <FormColumnSelector
                  visibleColumnKeys={visibleFormColumnKeys}
                  onVisibleColumnKeysChange={setVisibleFormColumnKeys}
                />
                {formSummary.entries.length > 5 ? (
                  <button
                    type="button"
                    onClick={() => setShowFormHistory((current) => !current)}
                    className="flex items-center gap-2 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 px-4 py-2 text-sm font-semibold text-purple-900 dark:text-purple-300 transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/50"
                    aria-expanded={showFormHistory}
                  >
                    <span>
                      {showFormHistory ? "Show Last 5 Races" : "View Full Form History"}
                    </span>
                    {showFormHistory ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">
                      {visibleFormColumns.map((column) => (
                        <th
                          key={column.key}
                          className={`px-4 py-3 whitespace-nowrap ${column.headerClassName ?? ""}`}
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-[#0E0F1A]/80">
                    {visibleFormEntries.length > 0 ? (
                      visibleFormEntries.map((entry, index) => (
                        <tr
                          key={`${entry.run_date ?? "unknown"}-${index}`}
                          className="align-middle transition-colors hover:bg-purple-50/20 dark:hover:bg-slate-800/40"
                        >
                          {visibleFormColumns.map((column) => (
                            <td
                              key={column.key}
                              className={`px-4 py-3 text-gray-700 dark:text-slate-300 font-medium whitespace-nowrap ${column.cellClassName ?? ""}`}
                            >
                              {column.render(entry)}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={Math.max(visibleFormColumns.length, 1)}
                          className="px-4 py-6 text-center text-sm font-medium text-gray-500 dark:text-slate-400"
                        >
                          No historical race results available for this horse yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div >
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-purple-100/70 dark:border-slate-800/80 bg-white dark:bg-[#121324] p-[clamp(0.875rem,1.5vw,1.25rem)] shadow-xs transition-all duration-300 ease-in-out">
      <div className="mb-3.5 flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 aspect-square items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-[clamp(0.95rem,1.2vw,1.125rem)] font-bold text-purple-900 dark:text-purple-200 leading-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DetailsGrid({ rows }: { rows: LabelValue[] }) {
  return (
    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col justify-center rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-[#121324] px-3 py-2 min-w-0 transition-colors"
        >
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 truncate">
            {row.label}
          </p>
          <p
            className="mt-0.5 text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white break-words leading-snug"
            title={row.value}
          >
            {row.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-slate-800/80 bg-gray-50/60 dark:bg-[#121324] p-[clamp(0.625rem,1.2vw,1rem)] text-center transition-all duration-300 ease-in-out hover:bg-gray-50 dark:hover:bg-slate-900 flex flex-col items-center justify-center min-w-0">
      <div className="mb-1.5 flex justify-center text-purple-700 dark:text-purple-400">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.1em] text-gray-500 dark:text-slate-400 truncate w-full">
        {label}
      </p>
      <p className="mt-0.5 text-sm sm:text-base font-extrabold text-gray-900 dark:text-white truncate w-full">{value}</p>
    </div>
  );
}

function TeamPerformanceChart({
  role,
  name,
  record,
}: {
  role: "Jockey" | "Trainer";
  name: string;
  record: string | null | undefined;
}) {
  const stats = parsePerformanceRecord(record);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-slate-800/80 bg-gray-50/60 dark:bg-[#121324] p-4 text-center relative flex flex-col items-center overflow-hidden w-full min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">
        {role}
      </p>
      <p className="mt-1 min-h-6 text-sm font-extrabold text-gray-900 dark:text-white truncate w-full">
        {name}
      </p>

      <div className="mt-3">
        <ChartLegend />
      </div>

      <div className="my-4 flex justify-center w-full">
        <SolidPerformancePie stats={stats} sizeClassName="w-24 h-24 sm:w-28 sm:h-28 shrink-0 aspect-square" label={`${role} performance`} />
      </div>

      {stats.isValid ? (
        <RecordResultLine stats={stats} className="w-full" />
      ) : (
        <div className="w-full flex flex-col items-center justify-center">
          <p className="text-xs font-black text-gray-400 whitespace-nowrap">0 - 0 - 0</p>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap text-center">
            {record && record !== "-" && record !== "0:0-0-0" ? `Record: ${record}` : "0 runs recorded"}
          </p>
        </div>
      )}
    </div>
  );
}

function RecordPieChart({
  label,
  record,
}: {
  label: string;
  record: string | null | undefined;
}) {
  const stats = parsePerformanceRecord(record);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-slate-800/80 bg-gray-50/60 dark:bg-[#121324] p-3 text-center relative flex flex-col items-center justify-between overflow-hidden w-full min-w-0 shadow-xs">
      <p className="min-h-5 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 truncate w-full">
        {label}
      </p>

      <div className="my-2.5 flex justify-center w-full">
        <SolidPerformancePie stats={stats} sizeClassName="w-14 h-14 sm:w-16 sm:h-16 shrink-0 aspect-square" label={`${label} record`} />
      </div>

      {stats.isValid ? (
        <RecordResultLine stats={stats} className="w-full" />
      ) : (
        <div className="w-full flex flex-col items-center justify-center">
          <p className="text-xs font-black text-gray-400 whitespace-nowrap">0 - 0 - 0</p>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap text-center">
            {record && record !== "-" && record !== "0:0-0-0" ? `Record: ${record}` : "0 runs recorded"}
          </p>
        </div>
      )}
    </div>
  );
}

function SolidPerformancePie({
  stats,
  sizeClassName,
  label,
}: {
  stats: ParsedPerformanceRecord;
  sizeClassName: string;
  label: string;
}) {
  const chartTotal = stats.isValid
    ? stats.wins + stats.seconds + stats.thirds + stats.remainingRuns
    : 0;
  const percentage = (value: number) => (chartTotal > 0 ? (value / chartTotal) * 100 : 0);
  const winEnd = percentage(stats.wins);
  const secondEnd = winEnd + percentage(stats.seconds);
  const thirdEnd = secondEnd + percentage(stats.thirds);

  const chartBackground =
    chartTotal > 0
      ? `conic-gradient(
          ${CHART_COLORS.wins} 0% ${winEnd}%,
          ${CHART_COLORS.seconds} ${winEnd}% ${secondEnd}%,
          ${CHART_COLORS.thirds} ${secondEnd}% ${thirdEnd}%,
          ${CHART_COLORS.remaining} ${thirdEnd}% 100%
        )`
      : CHART_COLORS.empty;

  return (
    <div
      className={`${sizeClassName} shrink-0 aspect-square rounded-full border border-white dark:border-slate-800 shadow-[0_10px_30px_rgba(88,28,135,0.16)]`}
      style={{ background: chartBackground }}
      aria-label={`${label} pie chart`}
      role="img"
    />
  );
}

function RecordResultLine({
  stats,
  className = "",
}: {
  stats: ParsedPerformanceRecord;
  className?: string;
}) {
  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      <div className="flex items-center justify-center gap-1 text-xs font-black whitespace-nowrap">
        <span style={{ color: CHART_COLORS.wins }}>{stats.wins}</span>
        <span className="text-gray-400">-</span>
        <span style={{ color: CHART_COLORS.seconds }}>{stats.seconds}</span>
        <span className="text-gray-400">-</span>
        <span style={{ color: CHART_COLORS.thirds }}>{stats.thirds}</span>
      </div>
      <p className="mt-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap text-center">
        Last {stats.totalRuns} runs
      </p>
    </div>
  );
}

function ChartLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-bold text-gray-600 dark:text-slate-300">
      <LegendItem color={CHART_COLORS.wins} label="Wins" />
      <LegendItem color={CHART_COLORS.seconds} label="2nd places" />
      <LegendItem color={CHART_COLORS.thirds} label="3rd places" />
      <LegendItem color={CHART_COLORS.remaining} label="Other places" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 shrink-0">
      <span className="h-2.5 w-2.5 shrink-0 aspect-square rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function FormColumnSelector({
  visibleColumnKeys,
  onVisibleColumnKeysChange,
}: {
  visibleColumnKeys: FormColumnKey[];
  onVisibleColumnKeysChange: (keys: FormColumnKey[]) => void;
}) {
  const visibleKeySet = useMemo(() => new Set(visibleColumnKeys), [visibleColumnKeys]);
  const orderedSelectorColumns = useMemo(() => {
    const selectedColumns = visibleColumnKeys
      .map((key) => FORM_COLUMNS.find((column) => column.key === key))
      .filter((column): column is FormColumnDefinition => Boolean(column));
    const unselectedColumns = FORM_COLUMNS.filter((column) => !visibleKeySet.has(column.key));
    return [...selectedColumns, ...unselectedColumns];
  }, [visibleColumnKeys, visibleKeySet]);

  const toggleColumn = (key: FormColumnKey) => {
    if (visibleKeySet.has(key)) {
      onVisibleColumnKeysChange(visibleColumnKeys.filter((item) => item !== key));
      return;
    }

    onVisibleColumnKeysChange([...visibleColumnKeys, key]);
  };

  const selectAll = () => {
    onVisibleColumnKeysChange(DEFAULT_FORM_COLUMN_KEYS);
  };

  const deselectAll = () => {
    onVisibleColumnKeysChange([]);
  };

  const moveColumn = (key: FormColumnKey, direction: -1 | 1) => {
    const currentIndex = visibleFormColumnIndex(visibleColumnKeys, key);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= visibleColumnKeys.length) {
      return;
    }

    const nextKeys = [...visibleColumnKeys];
    const [removed] = nextKeys.splice(currentIndex, 1);
    nextKeys.splice(nextIndex, 0, removed);
    onVisibleColumnKeysChange(nextKeys);
  };

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-purple-900 dark:text-purple-300 shadow-sm transition-colors hover:bg-purple-50 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
        <ListFilter className="h-4 w-4" />
        Columns ({visibleColumnKeys.length}/{FORM_COLUMNS.length})
        <ChevronDown className="h-4 w-4" />
      </summary>

      <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-purple-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-left shadow-xl shadow-purple-900/10 dark:shadow-none">
        <div className="mb-2.5 flex flex-col gap-2 border-b border-gray-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">
              Form Columns
            </p>
            <button
              type="button"
              onClick={selectAll}
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300 transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/60 cursor-pointer"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="flex-1 rounded-lg border border-purple-200 dark:border-purple-800/60 bg-purple-50/60 dark:bg-purple-950/40 py-1.5 text-center text-xs font-bold text-purple-700 dark:text-purple-300 transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/60 cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 py-1.5 text-center text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
          {orderedSelectorColumns.map((column) => {
            const isVisible = visibleKeySet.has(column.key);
            const selectedIndex = visibleFormColumnIndex(visibleColumnKeys, column.key);

            return (
              <div
                key={column.key}
                className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <label className="flex min-w-0 cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => toggleColumn(column.key)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-purple-700 focus:ring-purple-600 cursor-pointer"
                  />
                  <span className="truncate">{column.label}</span>
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveColumn(column.key, -1)}
                    disabled={!isVisible || selectedIndex <= 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 dark:text-slate-400 transition-colors hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-700 dark:hover:text-purple-300 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Move ${column.label} earlier`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveColumn(column.key, 1)}
                    disabled={!isVisible || selectedIndex === visibleColumnKeys.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 dark:text-slate-400 transition-colors hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-700 dark:hover:text-purple-300 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Move ${column.label} later`}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}

function visibleFormColumnIndex(keys: FormColumnKey[], key: FormColumnKey) {
  return keys.findIndex((item) => item === key);
}
