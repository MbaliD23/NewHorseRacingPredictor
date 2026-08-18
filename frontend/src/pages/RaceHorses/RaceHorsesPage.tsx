import { useMemo } from "react";
import { Activity, ArrowRight, Calendar, Clock, Compass, Sparkles, Trophy, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";
import { SilksRenderer } from "@/components/horse/SilksRenderer";
import { sortHorses } from "@/lib/horseOrdering";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { useRace } from "@/hooks/useRace";
import { formatTime, valueOrUnavailable } from "@/lib/utils";
import { usePredictionStore, type HorseOrderBy } from "@/store/predictionStore";

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

export function RaceHorsesPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const { data: race, isLoading, isError } = useRace(raceId);
  const { setCurrentRace, setCurrentHorse, horseOrderBy, setHorseOrderBy } = usePredictionStore();
  const runnerCount = race?.horses?.length ?? race?.field_size ?? 0;
  const raceStatus = valueOrUnavailable(race?.status);
  const orderedHorses = useMemo(
    () => sortHorses(race?.horses ?? [], horseOrderBy),
    [horseOrderBy, race?.horses],
  );

  const getNumberStyle = (runnerNumber: number | null | undefined) => {
    const num = runnerNumber ?? 0;
    switch (num) {
      case 1: return "bg-[#6A2DF1] text-white";
      case 2: return "bg-white text-slate-900 border border-slate-200";
      case 3: return "bg-[#1A56DB] text-white";
      case 4: return "bg-slate-200 text-slate-900";
      case 5: return "bg-[#DC2626] text-white";
      default: return "bg-slate-800 text-white";
    }
  };

  return (
    <section className="page-section screen-shell w-full gap-6 py-4">
      <AsyncBoundary isLoading={isLoading} isError={isError} isEmpty={!race} emptyMessage="Race unavailable.">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-2 sm:px-4 lg:px-6">
          <div className="rounded-[32px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6A2DF1]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(race?.race_time)}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">
                Race {race?.race_number ?? ""}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">
                {valueOrUnavailable(race?.distance)}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">
                {valueOrUnavailable(race?.surface)}
              </span>
              <div className="ml-auto flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#6A2DF1] uppercase">
                <div className="h-2 w-2 rounded-full bg-[#6A2DF1] animate-pulse" />
                Live
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#6A2DF1]/80">
                  Race {valueOrUnavailable(race?.race_number)} dossier
                </p>
                <h1 className="mt-2 text-[clamp(2rem,3.4vw,3.4rem)] font-black leading-[0.95] tracking-tight text-slate-950">
                  {valueOrUnavailable(race?.title)}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500 sm:text-base">
                  {valueOrUnavailable(race?.venue)} · {raceStatus}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[560px]">
                <InfoStat label="Post time" value={formatTime(race?.race_time)} />
                <InfoStat label="Distance" value={valueOrUnavailable(race?.distance)} />
                <InfoStat label="Field" value={`${runnerCount} runners`} />
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
            <GlassCard className="overflow-hidden border-slate-200 bg-white text-slate-900 shadow-[0_16px_44px_rgba(15,23,42,0.07)]">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#6A2DF1]">
                  Race Information
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Meeting details</h2>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <InfoTile icon={Calendar} label="Meeting date" value={formatRaceDate(race?.meeting_date)} />
                <InfoTile icon={Clock} label="Post time" value={formatTime(race?.race_time)} />
                <InfoTile icon={Compass} label="Surface" value={valueOrUnavailable(race?.surface)} />
                <InfoTile icon={Trophy} label="Declared field" value={`${runnerCount} runners`} />
              </div>
            </GlassCard>

            <GlassCard className="overflow-hidden border-slate-200 bg-white text-slate-900 shadow-[0_16px_44px_rgba(15,23,42,0.07)]">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#6A2DF1]">
                  Track Profile
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Conditions</h2>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <InfoTile icon={Activity} label="Distance" value={valueOrUnavailable(race?.distance)} />
                <InfoTile icon={Compass} label="Surface" value={valueOrUnavailable(race?.surface)} />
                <InfoTile icon={Users} label="Field size" value={`${runnerCount} runners`} />
                <InfoTile icon={Trophy} label="Status" value={raceStatus} />
              </div>
            </GlassCard>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Order By
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Default race-card view sorts horses by draw number.
                </p>
              </div>
              <select
                value={horseOrderBy}
                onChange={(event) => setHorseOrderBy(event.target.value as HorseOrderBy)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition-colors focus:border-[#6A2DF1] focus:bg-white sm:w-[240px]"
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
              {orderedHorses.map((horse) => (
                <div
                  key={horse.id}
                  className="grid cursor-pointer gap-4 rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#6A2DF1]/60 hover:shadow-[0_0_22px_rgba(106,45,241,0.14)] sm:p-5 xl:grid-cols-[auto_auto_minmax(0,1.8fr)_repeat(4,minmax(108px,0.7fr))_minmax(128px,auto)] xl:items-center"
                  onClick={() => {
                    setCurrentRace(race ?? null);
                    setCurrentHorse(horse);
                    navigate(`/horses/${horse.id}`);
                  }}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-xl ${getNumberStyle(horse.runner_number)}`}>
                    {valueOrUnavailable(horse.runner_number)}
                  </div>

                  <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                    <div className="flex h-full w-full items-center justify-center">
                      <SilksRenderer description={horse.silks} className="h-14 w-14" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-[17px] font-black leading-tight text-slate-950 sm:text-[18px]">
                      {horse.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {valueOrUnavailable(race?.venue)} · Race {valueOrUnavailable(race?.race_number)}
                    </p>
                  </div>

                  <InfoColumn label="Draw" value={valueOrUnavailable(horse.draw_number)} />
                  <InfoColumn label="Horse No" value={valueOrUnavailable(horse.runner_number)} />
                  <InfoColumn label="Weight" value={valueOrUnavailable(horse.weight_value)} />
                  <InfoColumn label="MR" value={valueOrUnavailable(horse.merit_rating)} />

                  <div className="grid gap-2 text-sm text-slate-500">
                    <p className="truncate">
                      <span className="font-semibold text-slate-600">J:</span> {valueOrUnavailable(horse.jockey_name)}
                    </p>
                    <p className="truncate">
                      <span className="font-semibold text-slate-600">T:</span> {valueOrUnavailable(horse.trainer_name)}
                    </p>
                  </div>

                  <button
                    className="justify-self-start whitespace-nowrap rounded-[10px] border-[1.5px] border-[#6A2DF1] px-4 py-2 text-[13px] font-bold text-[#6A2DF1] transition-colors hover:bg-violet-50 active:scale-[0.99]"
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
              ))}
            </div>
          </AsyncBoundary>
        </div>
      </AsyncBoundary>
      <div className="mx-auto w-full max-w-[1600px] px-2 pb-6 sm:px-4 lg:px-6">
        <div className="flex justify-end">
          <Button
            size="lg"
            className="prediction-cta solid-purple-btn w-full sm:w-auto sm:min-w-[320px]"
            onClick={() => navigate(`/analysis/${race?.id}`)}
          >
            <Sparkles className="h-5 w-5" /> Go to Prediction
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
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
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
      <Icon className="h-5 w-5 text-[#6A2DF1]" />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function InfoColumn({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-[15px] font-bold text-slate-950">{value}</p>
    </div>
  );
}
