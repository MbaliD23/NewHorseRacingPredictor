import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Footprints,
  Glasses,
  Heart,
  Layers,
  ListFilter,
  Medal,
  Palette,
  Scale,
  Tag,
  Trophy,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SilksRenderer } from "@/components/horse/SilksRenderer";
import type { Horse, HorseFormEntry } from "@/types/race";

interface HorseAnalysisViewProps {
  horse: Horse | null;
  raceTitle?: string;
  raceNumber?: number;
  raceDistance?: string | null;
  venueName?: string;
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
  | "date"
  | "position"
  | "track"
  | "raceNumber"
  | "distance"
  | "jockey"
  | "weight"
  | "draw"
  | "margin"
  | "winner"
  | "winnerWeight"
  | "speedFigure"
  | "rating"
  | "odds"
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
    key: "date",
    label: "Date",
    cellClassName: "font-semibold text-gray-900",
    render: (entry) => formatDate(entry.run_date, entry.raw_date_text),
  },
  {
    key: "position",
    label: "Pos",
    render: (entry) => (
      <span
        className={`inline-flex min-w-9 items-center justify-center rounded-lg border px-2.5 py-1 font-bold ${getFormBadgeTone(entry.finish_position)}`}
      >
        {valueOrDash(entry.finish_position)}
      </span>
    ),
  },
  { key: "track", label: "Track", render: (entry) => valueOrDash(entry.track) },
  { key: "raceNumber", label: "Race No", render: (entry) => valueOrDash(entry.race_number) },
  { key: "distance", label: "Distance", render: (entry) => valueOrDash(entry.distance) },
  { key: "jockey", label: "Jockey", render: (entry) => valueOrDash(entry.jockey_name) },
  { key: "weight", label: "Wgt", render: (entry) => valueOrDash(entry.weight) },
  { key: "draw", label: "Draw", render: (entry) => valueOrDash(entry.draw) },
  { key: "margin", label: "Margin", render: (entry) => valueOrDash(entry.margin_behind_winner) },
  { key: "winner", label: "Winner", render: (entry) => valueOrDash(entry.winner_name) },
  { key: "winnerWeight", label: "Winner Wgt", render: (entry) => valueOrDash(entry.winner_weight) },
  { key: "speedFigure", label: "Speed Fig", render: (entry) => valueOrDash(entry.speed_figure) },
  { key: "rating", label: "Rating", render: (entry) => valueOrDash(entry.rating) },
  { key: "odds", label: "Odds", render: (entry) => valueOrDash(entry.odds) },
  { key: "comment", label: "Comment", render: (entry) => valueOrDash(entry.comment) },
  { key: "formSummary", label: "Form Summary", render: (entry) => valueOrDash(entry.form_summary) },
];

const DEFAULT_FORM_COLUMN_KEYS: FormColumnKey[] = [
  "date",
  "position",
  "track",
  "distance",
  "jockey",
  "weight",
  "draw",
  "rating",
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

function valueOrDash(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return "-";
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

  const match = record.trim().match(/^(\d+)\s*:\s*(\d+)-(\d+)-(\d+)$/);
  if (!match) {
    return {
      totalRuns: 0,
      wins: 0,
      seconds: 0,
      thirds: 0,
      remainingRuns: 0,
      isValid: false,
    };
  }

  const totalRuns = Number(match[1]);
  const wins = Number(match[2]);
  const seconds = Number(match[3]);
  const thirds = Number(match[4]);
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

    const validKeys = parsed.filter((key): key is FormColumnKey => FORM_COLUMN_KEYS.has(key));
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
    .map((entry) => Number(entry.rating))
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
}: HorseAnalysisViewProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFormHistory, setShowFormHistory] = useState(false);
  const [visibleFormColumnKeys, setVisibleFormColumnKeys] = useState<FormColumnKey[]>(
    loadStoredFormColumns,
  );

  const [profilePage, setProfilePage] = useState(0);
  const profileScrollRef = useRef<HTMLDivElement>(null);

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

  const recordCharts = [
    { label: "Record", record: horse?.total_runs },
    { label: "Wet", record: horse?.wet_record },
    { label: "Course", record: horse?.course_record },
    { label: "Distance", record: horse?.distance_record },
    { label: "Course & Distance", record: horse?.course_distance_record },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-2 py-4 text-gray-800 sm:px-4 lg:px-6">
      <div className="space-y-6 rounded-3xl border border-purple-100/80 bg-white p-4 shadow-[0_10px_40px_rgba(139,92,246,0.06)] sm:p-7">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-700"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-700 text-lg font-bold text-white shadow-md shadow-purple-600/20">
                {saddleNo}
              </span>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight text-gray-900 sm:text-2xl">
                  {horseName}
                </h1>
                {raceTitle ? (
                  <p className="text-xs font-medium text-purple-600">
                    {venueName ? `${venueName} • ` : ""}
                    Race {raceNumber ? `${raceNumber}: ` : ""}
                    {raceTitle}
                  </p>
                ) : null}

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-gray-700">
                  <span>Draw: {valueOrDash(horse?.draw_number)}</span>

                  <span className="text-gray-300">•</span>

                  <span>Distance: {valueOrDash(raceDistance)}</span>
                </div>

              </div>
            </div>
          </div>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${isFavorite
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-gray-200 bg-white text-gray-400 hover:text-red-500"
              }`}
            aria-label="Favorite horse"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-[1.4fr_0.9fr]">

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
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => goToProfilePage(0)}
                aria-label="Show horse profile"
                className={`h-2.5 w-2.5 rounded-full transition-all ${profilePage === 0
                  ? "bg-purple-700"
                  : "bg-gray-300 hover:bg-purple-300"
                  }`}
              />

              <button
                type="button"
                onClick={() => goToProfilePage(1)}
                aria-label="Show horse pedigree"
                className={`h-2.5 w-2.5 rounded-full transition-all ${profilePage === 1
                  ? "bg-purple-700"
                  : "bg-gray-300 hover:bg-purple-300"
                  }`}
              />
            </div>
          </SectionCard>

          <SectionCard icon={Palette} title="Jockey Colours">
            <div className="space-y-4">

              <div className="flex justify-center py-2">
                <SilksRenderer
                  description={horse?.silks}
                  className="h-28 w-28"
                />
              </div>

              <p className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4 text-sm leading-relaxed text-purple-950">
                {valueOrDash(horse?.silks)}
              </p>

            </div>
          </SectionCard>

        </div>

        <div className="grid gap-6">
          <SectionCard icon={User} title="The Team">
            <div className="grid gap-5 sm:grid-cols-2">
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

        <SectionCard icon={Trophy} title="Record Breakdown">
          <div className="space-y-5">
            <ChartLegend />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

        <SectionCard icon={Tag} title="Technical Details">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile icon={Scale} label="Weight" value={technicalRows[0].value} />
            <MetricTile icon={Glasses} label="Blinkers" value={technicalRows[1].value} />
            <MetricTile icon={Footprints} label="Alumites" value={technicalRows[2].value} />
            <MetricTile icon={Trophy} label="Stakes" value={technicalRows[3].value} />
            <MetricTile icon={Tag} label="Sale Price" value={technicalRows[4].value} />
          </div>
        </SectionCard>

        <SectionCard icon={Trophy} title="Recent Form">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
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
                  <span className="text-sm font-medium text-gray-500">
                    No recent form history available.
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-gray-700">
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
                    className="flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-900 transition-colors hover:bg-purple-100"
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

            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      {visibleFormColumns.map((column) => (
                        <th
                          key={column.key}
                          className={`px-4 py-3 ${column.headerClassName ?? ""}`}
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {visibleFormEntries.length > 0 ? (
                      visibleFormEntries.map((entry, index) => (
                        <tr key={`${entry.run_date ?? "unknown"}-${index}`} className="align-top">
                          {visibleFormColumns.map((column) => (
                            <td
                              key={column.key}
                              className={`px-4 py-3 text-gray-700 ${column.cellClassName ?? ""}`}
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
                          className="px-4 py-6 text-center text-sm text-gray-500"
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
    <section className="rounded-2xl border border-purple-100/70 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-purple-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DetailsGrid({ rows }: { rows: LabelValue[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            {row.label}
          </p>
          <p className="mt-1 text-sm font-bold text-gray-900">{row.value}</p>
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
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 text-center">
      <div className="mb-2 flex justify-center text-purple-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-base font-extrabold text-gray-900">{value}</p>
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
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
        {role}
      </p>
      <p className="mt-1 min-h-10 text-sm font-extrabold text-gray-900">
        {name}
      </p>

      <div className="mt-4">
        <ChartLegend />
      </div>

      <div className="mt-5 flex justify-center">
        <SolidPerformancePie stats={stats} sizeClassName="h-36 w-36" label={`${role} performance`} />
      </div>

      {stats.isValid ? (
        <RecordResultLine stats={stats} className="mt-5" />
      ) : (
        <p className="mt-5 text-sm font-semibold text-gray-500">
          No record available
        </p>
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
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 text-center">
      <p className="min-h-8 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
        {label}
      </p>

      <div className="mt-4 flex justify-center">
        <SolidPerformancePie stats={stats} sizeClassName="h-32 w-32" label={`${label} record`} />
      </div>

      {stats.isValid ? (
        <RecordResultLine stats={stats} className="mt-4" />
      ) : (
        <p className="mt-4 text-sm font-semibold text-gray-500">
          No record available
        </p>
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
      className={`${sizeClassName} rounded-full border border-white shadow-[0_10px_30px_rgba(88,28,135,0.16)]`}
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
    <div className={className}>
      <p className="text-lg font-black">
        <span style={{ color: CHART_COLORS.wins }}>{stats.wins}</span>
        <span className="px-1.5 text-gray-800">-</span>
        <span style={{ color: CHART_COLORS.seconds }}>{stats.seconds}</span>
        <span className="px-1.5 text-gray-800">-</span>
        <span style={{ color: CHART_COLORS.thirds }}>{stats.thirds}</span>
      </p>
      <p className="mt-1 text-xs font-semibold text-gray-500">
        Last {stats.totalRuns} runs
      </p>
    </div>
  );
}

function ChartLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-bold text-gray-600">
      <LegendItem color={CHART_COLORS.wins} label="Wins" />
      <LegendItem color={CHART_COLORS.seconds} label="2nd places" />
      <LegendItem color={CHART_COLORS.thirds} label="3rd places" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
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
      if (visibleColumnKeys.length === 1) {
        return;
      }
      onVisibleColumnKeysChange(visibleColumnKeys.filter((item) => item !== key));
      return;
    }

    onVisibleColumnKeysChange([...visibleColumnKeys, key]);
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
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-900 shadow-sm transition-colors hover:bg-purple-50 [&::-webkit-details-marker]:hidden">
        <ListFilter className="h-4 w-4" />
        Columns
        <ChevronDown className="h-4 w-4" />
      </summary>

      <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-purple-100 bg-white p-3 text-left shadow-xl shadow-purple-900/10">
        <div className="mb-2 flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
            Form columns
          </p>
          <button
            type="button"
            onClick={() => onVisibleColumnKeysChange(DEFAULT_FORM_COLUMN_KEYS)}
            className="rounded-full px-2 py-1 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-50"
          >
            Reset
          </button>
        </div>

        <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
          {orderedSelectorColumns.map((column) => {
            const isVisible = visibleKeySet.has(column.key);
            const selectedIndex = visibleFormColumnIndex(visibleColumnKeys, column.key);

            return (
              <div
                key={column.key}
                className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-50"
              >
                <label className="flex min-w-0 cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    disabled={isVisible && visibleColumnKeys.length === 1}
                    onChange={() => toggleColumn(column.key)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-purple-600"
                  />
                  <span className="truncate">{column.label}</span>
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveColumn(column.key, -1)}
                    disabled={!isVisible || selectedIndex <= 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Move ${column.label} earlier`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveColumn(column.key, 1)}
                    disabled={!isVisible || selectedIndex === visibleColumnKeys.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-30"
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
