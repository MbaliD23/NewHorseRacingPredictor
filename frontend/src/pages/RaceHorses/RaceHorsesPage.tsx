import { useMemo, useState } from "react";
import { Clock, Sparkles, MapPin, Calendar, Users, Activity, Compass, Trophy } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
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
  const [tab, setTab] = useState<"horses" | "info">("horses");
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
    <section className="flex flex-col h-[100dvh] w-full bg-[#FAFAFA] text-slate-900 overflow-hidden font-sans">
      <div className="bg-white rounded-b-3xl shadow-sm pb-0 z-10 pl-16 sm:pl-20 md:pl-24">
        <header className="flex items-center gap-3 p-4 pb-2">
          <h1 className="text-[22px] leading-none font-bold text-slate-900 tracking-tight">
            Race {race?.race_number ?? ""} &ndash; {valueOrUnavailable(race?.title)}
          </h1>
        </header>

        <div className="flex items-center gap-3 px-4 pb-4 text-[15px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5 text-[#6A2DF1]">
            <Clock className="h-[18px] w-[18px]" /> {formatTime(race?.race_time)}
          </span>
          <span className="text-slate-200">|</span>
          <span>{valueOrUnavailable(race?.distance)}</span>
          {race?.surface && (
            <>
              <span className="text-slate-200">|</span>
              <span>{race.surface}</span>
            </>
          )}
          
          <div className="ml-auto flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-2.5 py-0.5">
            <div className="h-2 w-2 rounded-full bg-[#6A2DF1] animate-pulse"></div>
            <span className="text-[11px] font-bold tracking-wider text-[#6A2DF1] uppercase">LIVE</span>
          </div>
        </div>

        <div className="flex px-4 relative">
          <button 
            className={`flex-1 pb-3 pt-2 text-center text-[15px] font-bold transition-colors ${tab === "horses" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`} 
            onClick={() => setTab("horses")}
          >
            Horses
            {tab === "horses" && (
              <div className="absolute bottom-0 left-0 w-1/2 h-[3px] bg-[#6A2DF1] rounded-t-full px-4 bg-clip-content" />
            )}
          </button>
          <button 
            className={`flex-1 pb-3 pt-2 text-center text-[15px] font-bold transition-colors ${tab === "info" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`} 
            onClick={() => setTab("info")}
          >
            Race Info
            {tab === "info" && (
              <div className="absolute bottom-0 right-0 w-1/2 h-[3px] bg-[#6A2DF1] rounded-t-full px-4 bg-clip-content" />
            )}
          </button>
          {/* Subtle bottom border line for the whole tab area */}
          <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-slate-100 -z-10" />
        </div>
      </div>

      <AsyncBoundary isLoading={isLoading} isError={isError} isEmpty={!race} emptyMessage="Race unavailable.">
        <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth">
          {tab === "horses" ? (
            <AsyncBoundary isEmpty={orderedHorses.length === 0} emptyMessage="No horses available.">
              <div className="flex flex-col gap-3.5 pb-2">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition-colors focus:border-[#6A2DF1] focus:bg-white"
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

                {orderedHorses.map((horse) => (
                  <div
                    key={horse.id}
                    className="flex items-center gap-4 rounded-xl bg-white p-3.5 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] border border-slate-100 transition-all duration-200 hover:scale-[1.02] hover:border-[#6A2DF1]/60 hover:shadow-[0_0_22px_rgba(106,45,241,0.3)] cursor-pointer active:scale-[0.99]"
                    onClick={() => {
                      setCurrentRace(race ?? null);
                      setCurrentHorse(horse);
                      navigate(`/horses/${horse.id}`);
                    }}
                  >
                    <div className={`flex h-11 w-9 items-center justify-center rounded-[4px] font-bold text-xl ${getNumberStyle(horse.runner_number)}`}>
                      {valueOrUnavailable(horse.runner_number)}
                    </div>
                    
                    <div className="h-16 w-16 overflow-hidden flex-shrink-0">
                      <div className="flex h-full w-full items-center justify-center rounded-lg border border-slate-100 bg-slate-50">
                        <SilksRenderer description={horse.silks} className="h-14 w-14" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="truncate text-[17px] font-bold text-slate-900 leading-tight">{horse.name}</h2>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-semibold text-slate-500">
                        <span>Draw: {valueOrUnavailable(horse.draw_number)}</span>
                        <span>Horse No: {valueOrUnavailable(horse.runner_number)}</span>
                        <span>Weight: {valueOrUnavailable(horse.weight_value)}</span>
                        <span>MR: {valueOrUnavailable(horse.merit_rating)}</span>
                      </div>
                      <div className="flex flex-col text-[13px] text-slate-500 mt-1 space-y-0.5">
                        <span className="truncate">J: {valueOrUnavailable(horse.jockey_name)}</span>
                        <span className="truncate">T: {valueOrUnavailable(horse.trainer_name)}</span>
                      </div>
                    </div>

                    <button 
                      className="rounded-[8px] border-[1.5px] border-[#6A2DF1] px-3.5 py-1.5 text-[13px] font-bold text-[#6A2DF1] transition-colors hover:bg-violet-50 whitespace-nowrap"
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
          ) : (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-2">
              <div className="relative overflow-hidden rounded-[30px] bg-[#050507] p-5 text-white shadow-[0_26px_70px_rgba(0,0,0,0.32)] sm:p-6">
                <div className="absolute inset-x-5 top-0 h-[3px] bg-gradient-to-r from-[#6A2DF1] via-white to-[#8B5CF6]" />
                <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full border border-white/10" />
                <div className="absolute -right-8 top-24 h-24 w-56 rotate-[-18deg] rounded-full border border-[#8B5CF6]/25" />
                <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-[#6A2DF1]/22 to-transparent" />

                <div className="relative grid gap-6 lg:grid-cols-[1fr_220px] lg:items-stretch">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                        <MapPin className="h-3.5 w-3.5" />
                        {valueOrUnavailable(race?.venue)}
                      </span>
                      <span className="rounded-full border border-[#8B5CF6]/45 bg-[#6A2DF1]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C4B5FD]">
                        {raceStatus}
                      </span>
                    </div>

                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-white/45">
                      Race {valueOrUnavailable(race?.race_number)} dossier
                    </p>
                    <h2 className="mt-2 max-w-2xl text-[32px] font-black leading-[0.98] tracking-tight text-white sm:text-5xl">
                      {valueOrUnavailable(race?.title)}
                    </h2>

                    <div className="mt-6 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/12 bg-white/[0.08] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">Post time</p>
                        <p className="mt-1 text-xl font-black text-white">{formatTime(race?.race_time)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/12 bg-white/[0.08] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">Distance</p>
                        <p className="mt-1 text-xl font-black text-white">{valueOrUnavailable(race?.distance)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/12 bg-white/[0.08] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">Field</p>
                        <p className="mt-1 text-xl font-black text-white">{runnerCount} runners</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-[24px] border border-[#8B5CF6]/45 bg-white/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                    <div>
                      <Calendar className="h-5 w-5 text-[#A78BFA]" />
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Meeting date</p>
                      <p className="mt-1 text-2xl font-black leading-tight text-white">{formatRaceDate(race?.meeting_date)}</p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 rounded-full bg-[#6A2DF1]/18 px-3 py-2 text-xs font-bold text-[#C4B5FD]">
                      <Trophy className="h-4 w-4" />
                      Ready for prediction
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_16px_44px_rgba(15,23,42,0.07)] sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#6A2DF1]">Race conditions</p>
                    <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">Track profile</h3>
                  </div>
                  <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-500">
                    Key conditions used before moving into the prediction model.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <Activity className="h-5 w-5 text-[#c8952e]" />
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Distance</p>
                    <p className="mt-1 truncate text-lg font-black text-slate-950">{valueOrUnavailable(race?.distance)}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <Compass className="h-5 w-5 text-[#6A2DF1]" />
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Surface</p>
                    <p className="mt-1 truncate text-lg font-black capitalize text-slate-950">{valueOrUnavailable(race?.surface)}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <Users className="h-5 w-5 text-[#0f8f78]" />
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Declared field</p>
                    <p className="mt-1 truncate text-lg font-black text-slate-950">{runnerCount} runners</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AsyncBoundary>

      <div className="w-full bg-white border-t border-slate-100 px-4 py-4 pb-safe-offset-4 z-20">
        <div className="flex items-center justify-end gap-4 max-w-4xl mx-auto">
          <Button 
            size="lg" 
            className="prediction-cta solid-purple-btn flex-1 max-w-sm" 
            onClick={() => navigate(`/analysis/${race?.id}`)}
          >
            <Sparkles className="h-5 w-5" /> Go to Prediction
          </Button>
        </div>
      </div>
    </section>
  );
}
