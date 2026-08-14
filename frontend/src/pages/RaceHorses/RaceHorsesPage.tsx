import { useMemo, useState } from "react";
import { ArrowLeft, Clock, Sparkles, MapPin, Calendar, Users, Activity, Compass, Trophy } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { SilksRenderer } from "@/components/horse/SilksRenderer";
import { sortHorses } from "@/lib/horseOrdering";
import { BackButton } from "@/components/navigation/BackButton";
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
      <div className="bg-white rounded-b-3xl shadow-sm pb-0 z-10">
        <header className="flex items-center gap-3 p-4 pb-2">
          <button 
            onClick={() => navigate(-1)} 
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors -ml-2"
          >
            <ArrowLeft className="h-6 w-6 text-slate-900" />
          </button>
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
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 pb-2">
              <div className="relative overflow-hidden rounded-[28px] border border-[#172033] bg-[#08111f] p-5 text-white shadow-[0_24px_60px_rgba(8,17,31,0.24)]">
                <div className="absolute inset-x-5 top-0 h-[3px] bg-gradient-to-r from-[#c8952e] via-[#f4d27a] to-[#6A2DF1]" />
                <div className="absolute -right-20 top-10 h-52 w-52 rounded-full border border-white/10" />
                <div className="absolute -right-9 top-[6.2rem] h-[1px] w-44 rotate-[-18deg] bg-white/10" />

                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f4d27a]">
                        <MapPin className="h-3.5 w-3.5" />
                        {valueOrUnavailable(race?.venue)}
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                        {raceStatus}
                      </span>
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.28em] text-white/42">
                      Race {valueOrUnavailable(race?.race_number)}
                    </p>
                    <h2 className="mt-1 text-[30px] font-black leading-[0.95] tracking-tight text-white sm:text-4xl">
                      {valueOrUnavailable(race?.title)}
                    </h2>
                  </div>

                  <div className="grid h-[92px] w-[92px] shrink-0 place-items-center rounded-full border border-[#f4d27a]/35 bg-[#f4d27a]/10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                    <div>
                      <Clock className="mx-auto h-5 w-5 text-[#f4d27a]" />
                      <strong className="mt-1 block text-xl leading-none text-white">{formatTime(race?.race_time)}</strong>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/52">post</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                  <Users className="h-5 w-5 text-[#6A2DF1]" />
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Field</p>
                  <p className="mt-1 truncate text-lg font-black text-slate-950">{runnerCount} runners</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                  <Calendar className="h-5 w-5 text-[#0f8f78]" />
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Date</p>
                  <p className="mt-1 truncate text-base font-black text-slate-950">{valueOrUnavailable(race?.meeting_date)}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                  <Activity className="h-5 w-5 text-[#c8952e]" />
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Distance</p>
                  <p className="mt-1 truncate text-lg font-black text-slate-950">{valueOrUnavailable(race?.distance)}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                  <Compass className="h-5 w-5 text-[#334155]" />
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Surface</p>
                  <p className="mt-1 truncate text-lg font-black capitalize text-slate-950">{valueOrUnavailable(race?.surface)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-[#ead8a7] bg-[#fff9ea] p-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#08111f] text-[#f4d27a]">
                  <Trophy className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-slate-950">Prediction setup</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Next, tune the model around speed index, draw advantages, trainer form, and race conditions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AsyncBoundary>

      <div className="w-full bg-white border-t border-slate-100 px-4 py-4 pb-safe-offset-4 z-20">
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
          <BackButton label="Back" showLabel className="analysis-back light-pill-btn shrink-0" />
          
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
