import { useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Glasses,
  Heart,
  Layers,
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
  venueName?: string;
}

type LabelValue = {
  label: string;
  value: string;
};

const DISPLAY_DATE = new Date("2026-08-14T00:00:00");

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
    return { runs: "-", wins: "-", places: "-", winPercent: "-" };
  }

  const match = record.match(/^(\d+):(\d+)-(\d+)-(\d+)$/);
  if (!match) {
    return { runs: valueOrDash(record), wins: "-", places: "-", winPercent: "-" };
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
    places: String(places),
    winPercent,
  };
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
  venueName,
}: HorseAnalysisViewProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFormHistory, setShowFormHistory] = useState(false);

  const horseName = horse?.name ?? "Unknown horse";
  const saddleNo = horse?.runner_number ?? "-";
  const jockeyName = horse?.jockey_name ?? "-";
  const trainerName = horse?.trainer_name ?? "-";

  const { sex, colour } = useMemo(
    () => parseProfileSummary(horse?.pedigree_description),
    [horse?.pedigree_description],
  );
  const { sire, dam, damSire, summary } = useMemo(
    () => parsePedigreeLine(horse?.pedigree_line),
    [horse?.pedigree_line],
  );
  const runStats = useMemo(() => parseRunsRecord(horse?.total_runs), [horse?.total_runs]);
  const formSummary = useMemo(() => buildFormSummary(horse), [horse]);
  const visibleFormEntries = showFormHistory
    ? formSummary.entries
    : formSummary.entries.slice(0, 5);

  const profileRows: LabelValue[] = [
    { label: "Age", value: getAgeLabel(horse?.dob) },
    { label: "Sex", value: sex },
    { label: "Colour", value: colour },
    { label: "Sire", value: sire },
    { label: "Dam", value: dam },
    { label: "Dam Sire", value: damSire },
    { label: "Owner", value: valueOrDash(horse?.owner) },
    { label: "Breeder", value: valueOrDash(horse?.breeder) },
  ];

  const connectionRows: LabelValue[] = [
    { label: "Jockey", value: jockeyName },
    { label: "Trainer", value: trainerName },
  ];

  const statsRows: LabelValue[] = [
    { label: "Runs", value: runStats.runs },
    { label: "Wins", value: runStats.wins },
    { label: "Places", value: runStats.places },
    { label: "Stakes", value: valueOrDash(horse?.stakes) },
    { label: "Sale Price", value: valueOrDash(horse?.sale_price) },
    { label: "Win %", value: runStats.winPercent },
  ];

  const technicalRows: LabelValue[] = [
    {
      label: "Weight",
      value:
        horse?.weight_value !== null && horse?.weight_value !== undefined
          ? `${horse.weight_value.toFixed(1)} kg`
          : "-",
    },
    { label: "Draw", value: valueOrDash(horse?.draw_number) },
    { label: "Merit Rating", value: valueOrDash(horse?.merit_rating) },
    { label: "Equipment", value: valueOrDash(horse?.equipment) },
    { label: "Blinkers", value: horse?.equipment?.includes("B") ? "Yes" : "No" },
    { label: "Alumites", value: horse?.equipment?.includes("A") ? "Yes" : "No" },
  ];

  const recordRows: LabelValue[] = [
    { label: "Wet", value: valueOrDash(horse?.wet_record) },
    { label: "Course", value: valueOrDash(horse?.course_record) },
    { label: "Distance", value: valueOrDash(horse?.distance_record) },
    { label: "Course & Distance", value: valueOrDash(horse?.course_distance_record) },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-2 py-4 text-gray-800 sm:px-4">
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
                <p className="mt-1 text-sm font-semibold text-gray-700">{summary}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
              isFavorite
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-gray-200 bg-white text-gray-400 hover:text-red-500"
            }`}
            aria-label="Favorite horse"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <SectionCard icon={User} title="Horse Profile">
            <DetailsGrid rows={profileRows} />
          </SectionCard>

          <SectionCard icon={Palette} title="Jockey Colours">
            <div className="space-y-4">
              <div className="flex justify-center">
                <SilksRenderer description={horse?.silks} className="h-28 w-28" />
              </div>
              <p className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4 text-sm leading-relaxed text-purple-950">
                {valueOrDash(horse?.silks)}
              </p>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard icon={User} title="Connections">
            <DetailsGrid rows={connectionRows} />
          </SectionCard>

          <SectionCard icon={Trophy} title="Racing Statistics">
            <DetailsGrid rows={statsRows} />
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard icon={Tag} title="Technical Details">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <MetricTile icon={Scale} label="Weight" value={technicalRows[0].value} />
              <MetricTile icon={Layers} label="Draw" value={technicalRows[1].value} />
              <MetricTile icon={Medal} label="Merit Rating" value={technicalRows[2].value} />
              <MetricTile icon={Tag} label="Equipment" value={technicalRows[3].value} />
              <MetricTile icon={Glasses} label="Blinkers" value={technicalRows[4].value} />
              <MetricTile icon={Glasses} label="Alumites" value={technicalRows[5].value} />
            </div>
          </SectionCard>

          <SectionCard icon={Trophy} title="Record Breakdown">
            <DetailsGrid rows={recordRows} />
          </SectionCard>
        </div>

        <SectionCard icon={Trophy} title="Recent Form">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <MetricTile icon={Layers} label="Total Runs" value={formSummary.totalRuns} />
              <MetricTile icon={Trophy} label="Wins" value={formSummary.wins} />
              <MetricTile icon={Medal} label="Places" value={formSummary.places} />
              <MetricTile icon={Tag} label="Win %" value={formSummary.winPercent} />
              <MetricTile
                icon={Medal}
                label="Best Merit Rating"
                value={formSummary.bestMeritRating}
              />
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

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-700">
                {showFormHistory ? "Full form history" : "Last 5 races"}
              </p>
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

            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Pos</th>
                      <th className="px-4 py-3">Track</th>
                      <th className="px-4 py-3">Race No</th>
                      <th className="px-4 py-3">Distance</th>
                      <th className="px-4 py-3">Jockey</th>
                      <th className="px-4 py-3">Wgt</th>
                      <th className="px-4 py-3">Draw</th>
                      <th className="px-4 py-3">Margin</th>
                      <th className="px-4 py-3">Winner</th>
                      <th className="px-4 py-3">Winner Wgt</th>
                      <th className="px-4 py-3">Speed Fig</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3">Odds</th>
                      <th className="px-4 py-3">Comment</th>
                      <th className="px-4 py-3">Form Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white [&_td]:h-16 [&_td]:whitespace-nowrap [&_td]:align-middle">
                    {visibleFormEntries.length > 0 ? (
                      visibleFormEntries.map((entry, index) => (
                        <tr key={`${entry.run_date ?? "unknown"}-${index}`}>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {formatDate(entry.run_date, entry.raw_date_text)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex min-w-9 items-center justify-center rounded-lg border px-2.5 py-1 font-bold ${getFormBadgeTone(entry.finish_position)}`}
                            >
                              {valueOrDash(entry.finish_position)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{valueOrDash(entry.track)}</td>
                          <td className="px-4 py-3 text-gray-700">{valueOrDash(entry.race_number)}</td>
                          <td className="px-4 py-3 text-gray-700">{valueOrDash(entry.distance)}</td>
                          <td className="px-4 py-3 text-gray-700">
                            <span className="block max-w-28 truncate">{valueOrDash(entry.jockey_name)}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{valueOrDash(entry.weight)}</td>
                          <td className="px-4 py-3 text-gray-700">{valueOrDash(entry.draw)}</td>
                          <td className="px-4 py-3 text-gray-700">
                            {valueOrDash(entry.margin_behind_winner)}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <span className="block max-w-32 truncate">{valueOrDash(entry.winner_name)}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {valueOrDash(entry.winner_weight)}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{valueOrDash(entry.speed_figure)}</td>
                          <td className="px-4 py-3 text-gray-700">{valueOrDash(entry.rating)}</td>
                          <td className="px-4 py-3 text-gray-700">{valueOrDash(entry.odds)}</td>
                          <td className="px-4 py-3 text-gray-700">
                            <span className="block max-w-40 truncate">{valueOrDash(entry.comment)}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <span className="block max-w-72 truncate">{valueOrDash(entry.form_summary)}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={16} className="px-4 py-6 text-center text-sm text-gray-500">
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
    </div>
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
