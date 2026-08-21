import { useMemo } from "react";
import { Activity, ArrowRight, Calendar, Clock, Compass, MapPin, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, PredictorButton } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";
import { SilksRenderer } from "@/components/horse/SilksRenderer";
import { sortHorses } from "@/lib/horseOrdering";
import { horseColor } from "@/lib/horseAnalytics";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { BackButton } from "@/components/navigation/BackButton";
import { useRace } from "@/hooks/useRace";
import { formatTime, valueOrUnavailable } from "@/lib/utils";
import { usePredictionStore, type HorseOrderBy } from "@/store/predictionStore";
import type { Horse } from "@/types/race";
import greyvilleImg from "@/assets/greyville.png";
import turfonteinImg from "@/assets/Turffontein.png";
import kenilworthImg from "@/assets/Kenilworth.png";
import scotsvilleImg from "@/assets/Scottsville.png";
import fairviewImg from "@/assets/fairview.png";
import vaalImg from "@/assets/Vaal.png";
import trackConditionsImg from "@/assets/track-conditions.png";

const ORDER_OPTIONS: Array<{ value: HorseOrderBy; label: string }> = [
  { value: "draw_number", label: "Draw Number (Default)" },
  { value: "runner_number", label: "Horse Number (Winning Form)" },
  { value: "weight", label: "Weight" },
  { value: "merit_rating", label: "Merit Rating" },
  { value: "predicted_finish", label: "Predicted Finish" },
  { value: "odds", label: "Odds" },
  { value: "horse_name", label: "Horse Name" },
];

const formatRaceDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "Unavailable";

  const [year, month, day] = dateStr.split("-");
  const parsed =
    year && month && day
      ? new Date(Number(year), Number(month) - 1, Number(day))
      : new Date(dateStr);

  return Number.isNaN(parsed.getTime())
    ? valueOrUnavailable(dateStr)
    : parsed.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const getVenueImage = (venueName: string | null | undefined) => {
  const name = (venueName ?? "").toLowerCase();
  if (name.includes("greyville")) return greyvilleImg;
  if (name.includes("turffontein")) return turfonteinImg;
  if (name.includes("kenilworth")) return kenilworthImg;
  if (name.includes("scottsville")) return scotsvilleImg;
  if (name.includes("fairview")) return fairviewImg;
  if (name.includes("vaal")) return vaalImg;
  return greyvilleImg;
};

export function RaceHorsesPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const { data: race, isLoading, isError } = useRace(raceId);
  const { currentVenue, setCurrentRace, setCurrentHorse, horseOrderBy, setHorseOrderBy } = usePredictionStore();
  const runnerCount = race?.horses?.length ?? race?.field_size ?? 0;
  const raceStatus = valueOrUnavailable(race?.status);
  const orderedHorses = useMemo(
    () => sortHorses(race?.horses ?? [], horseOrderBy),
    [horseOrderBy, race?.horses],
  );

  const getHorseBadgeColor = (horse: Horse) => {
    const originalIndex = (race?.horses ?? []).findIndex((h) => String(h.id) === String(horse.id));
    if (originalIndex >= 0) {
      return horseColor(horse.id, originalIndex);
    }
    if (horse.runner_number !== undefined && horse.runner_number !== null) {
      return horseColor(horse.runner_number);
    }
    return horseColor(horse.id);
  };

  return (
    <section className="page-section screen-shell w-full gap-6 py-4">
      <AsyncBoundary isLoading={isLoading} isError={isError} isEmpty={!race} emptyMessage="Race unavailable.">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-2 sm:px-4 lg:px-6">
          <div className="rounded-[32px] border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#131424]/90 px-4 py-4 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <BackButton
                to={race?.meeting_id ? `/venues/${race.meeting_id}` : currentVenue?.id ? `/venues/${currentVenue.id}` : "/"}
                fallbackTo={race?.meeting_id ? `/venues/${race.meeting_id}` : currentVenue?.id ? `/venues/${currentVenue.id}` : "/"}
                label="Back to Races"
              />
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6A2DF1] dark:text-purple-400 flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 dark:border-purple-900/60 bg-violet-50 dark:bg-purple-950/40 px-3 py-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(race?.race_time)}
                </span>
                <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-slate-600 dark:text-slate-300">
                  Race {race?.race_number ?? ""}
                </span>
                <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-slate-600 dark:text-slate-300">
                  {runnerCount} runners
                </span>
                <div className="ml-auto flex items-center gap-1.5 rounded-full border border-violet-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#6A2DF1] dark:text-purple-300 uppercase">
                  <div className="h-2 w-2 rounded-full bg-[#6A2DF1] animate-pulse" />
                  Live
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#6A2DF1]/80 dark:text-purple-400">
                  Race {valueOrUnavailable(race?.race_number)} dossier
                </p>
                <h1 className="mt-2 text-[clamp(2rem,3.4vw,3.4rem)] font-black leading-[0.95] tracking-tight text-slate-950 dark:text-white">
                  {valueOrUnavailable(race?.title)}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
                  {valueOrUnavailable(race?.venue)} · {raceStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
            <GlassCard className="group overflow-hidden rounded-[1.2rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131424]/90 text-slate-900 dark:text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:ring-[3px] hover:ring-purple-600 hover:shadow-[0_12px_40px_rgb(0,0,0,0.15)]">
              <div className="relative h-36 overflow-hidden bg-slate-100 dark:bg-slate-800 sm:h-44">
                <img
                  src={getVenueImage(race?.venue)}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 sm:left-6 sm:right-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-purple-200">
                    Race Information
                  </p>
                  <h2 className="mt-1 text-xl font-black tracking-tight text-white">Meeting details</h2>
                </div>
              </div>
              <div className="grid gap-4 bg-white dark:bg-[#131424]/90 p-5 sm:grid-cols-2 sm:p-6">
                <InfoTile icon={Calendar} label="Meeting date" value={formatRaceDate(race?.meeting_date)} />
                <InfoTile icon={MapPin} label="Venue" value={valueOrUnavailable(race?.venue)} />
              </div>
            </GlassCard>

            <GlassCard className="group overflow-hidden rounded-[1.2rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131424]/90 text-slate-900 dark:text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:ring-[3px] hover:ring-purple-600 hover:shadow-[0_12px_40px_rgb(0,0,0,0.15)]">
              <div className="relative h-36 overflow-hidden bg-slate-100 dark:bg-slate-800 sm:h-44">
                <img
                  src={trackConditionsImg}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0413]/90 via-[#0A0413]/25 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 sm:left-6 sm:right-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-purple-200">
                    Track Profile
                  </p>
                  <h2 className="mt-1 text-xl font-black tracking-tight text-white">Conditions</h2>
                </div>
              </div>
              <div className="grid gap-4 bg-white dark:bg-[#131424]/90 p-5 sm:grid-cols-2 sm:p-6">
                <InfoTile icon={Activity} label="Distance" value={valueOrUnavailable(race?.distance)} />
                <InfoTile icon={Compass} label="Surface" value={valueOrUnavailable(race?.surface)} />
              </div>
            </GlassCard>
          </div>

          <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131424]/90 px-4 py-4 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Order By
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Default race-card view sorts horses by draw number.
                </p>
              </div>
              <select
                value={horseOrderBy}
                onChange={(event) => setHorseOrderBy(event.target.value as HorseOrderBy)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-colors focus:border-[#6A2DF1] focus:bg-white dark:focus:bg-slate-900 sm:w-[240px]"
                aria-label="Order horses by"
              >
                {ORDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AsyncBoundary isEmpty={orderedHorses.length === 0} emptyMessage="No horses available.">
            <div className="flex flex-col gap-4 pb-2">
              {orderedHorses.map((horse) => {
                const assignedColor = getHorseBadgeColor(horse);
                return (
                  <div
                    key={horse.id}
                    className="group grid cursor-pointer gap-4 rounded-[26px] border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#131424]/90 p-4 sm:p-5 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 hover:bg-slate-900/90 hover:backdrop-blur-md hover:border-purple-600 hover:ring-[3px] hover:ring-purple-600 hover:shadow-[0_12px_40px_rgb(0,0,0,0.25)] hover:-translate-y-1 xl:grid-cols-[auto_auto_minmax(0,1.8fr)_repeat(4,minmax(108px,0.7fr))_minmax(128px,auto)_auto] xl:items-center"
                    onClick={() => {
                      setCurrentRace(race ?? null);
                      setCurrentHorse(horse);
                      navigate(`/horses/${horse.id}`);
                    }}
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 aspect-square items-center justify-center rounded-xl font-bold text-xl text-white transition-all duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: assignedColor,
                        boxShadow: `0 0 12px ${assignedColor}55`,
                        border: `1px solid ${assignedColor}88`,
                      }}
                    >
                      {valueOrUnavailable(horse.runner_number)}
                    </div>

                  <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 group-hover:border-white/10 group-hover:bg-white/5 transition-colors duration-300">
                    <div className="flex h-full w-full items-center justify-center">
                      <SilksRenderer description={horse.silks} className="h-14 w-14" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-[17px] font-black leading-tight text-slate-950 dark:text-white group-hover:text-white transition-colors duration-300 sm:text-[18px]">
                      {horse.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-400 transition-colors duration-300">
                      {valueOrUnavailable(race?.venue)} · Race {valueOrUnavailable(race?.race_number)}
                    </p>
                  </div>

                  <InfoColumn label="Draw" value={valueOrUnavailable(horse.draw_number)} />
                  <InfoColumn label="Horse No" value={valueOrUnavailable(horse.runner_number)} />
                  <InfoColumn label="Weight" value={valueOrUnavailable(horse.weight_value)} />
                  <InfoColumn label="MR" value={valueOrUnavailable(horse.merit_rating)} />

                  <div className="grid gap-1 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-400 transition-colors duration-300">
                    <p className="truncate">
                      <span className="font-semibold text-slate-600 dark:text-purple-300 group-hover:text-purple-300">J:</span> {valueOrUnavailable(horse.jockey_name)}
                    </p>
                    <p className="truncate">
                      <span className="font-semibold text-slate-600 dark:text-purple-300 group-hover:text-purple-300">T:</span> {valueOrUnavailable(horse.trainer_name)}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="justify-self-start whitespace-nowrap rounded-xl border-[1.5px] border-[#6A2DF1] dark:border-purple-800 bg-white dark:bg-purple-950/40 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-500 group-hover:shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] px-4 py-2 text-[13px] font-bold text-[#6A2DF1] dark:text-purple-300 transition-all duration-300 active:scale-[0.99] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentRace(race ?? null);
                      setCurrentHorse(horse);
                      navigate(`/horses/${horse.id}`);
                    }}
                  >
                    View Info
                  </button>
                  </div>
                );
              })}
            </div>
          </AsyncBoundary>
        </div>
      </AsyncBoundary>
      <div className="mx-auto w-full max-w-[1600px] px-2 pb-6 sm:px-4 lg:px-6">
        <div className="flex justify-end">
          <PredictorButton
            raceId={race?.id}
            className="w-full sm:w-auto min-w-[280px]"
          />
        </div>
      </div>
    </section>
  );
}
function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/60 p-4">
      <Icon className="h-5 w-5 text-[#6A2DF1] dark:text-purple-400" />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function InfoColumn({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 group-hover:text-purple-300/80 transition-colors duration-300">{label}</p>
      <p className="mt-1 text-[15px] font-bold text-slate-950 dark:text-white group-hover:text-white transition-colors duration-300">{value}</p>
    </div>
  );
}
