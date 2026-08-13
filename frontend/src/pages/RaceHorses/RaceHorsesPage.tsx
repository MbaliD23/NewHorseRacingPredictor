import { useState } from "react";
import { ArrowLeft, Clock, Sparkles, MapPin, Calendar, Users, Activity, Compass, Trophy } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { BackButton } from "@/components/navigation/BackButton";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { useRace } from "@/hooks/useRace";
import { formatTime, valueOrUnavailable } from "@/lib/utils";
import { usePredictionStore } from "@/store/predictionStore";

export function RaceHorsesPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const { data: race, isLoading, isError } = useRace(raceId);
  const [tab, setTab] = useState<"horses" | "info">("horses");
  const { setCurrentRace, setCurrentHorse } = usePredictionStore();

  const getNumberStyle = (index: number) => {
    const num = index + 1;
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
            <AsyncBoundary isEmpty={(race?.horses ?? []).length === 0} emptyMessage="No horses available.">
              <div className="flex flex-col gap-3.5 pb-2">
                {race?.horses.map((horse, index) => (
                  <div
                    key={horse.id}
                    className="flex items-center gap-4 rounded-xl bg-white p-3.5 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] border border-slate-100 transition-all duration-200 hover:scale-[1.02] hover:border-[#6A2DF1]/60 hover:shadow-[0_0_22px_rgba(106,45,241,0.3)] cursor-pointer active:scale-[0.99]"
                    onClick={() => {
                      setCurrentRace(race ?? null);
                      setCurrentHorse(horse);
                      navigate(`/horses/${horse.id}`);
                    }}
                  >
                    <div className={`flex h-11 w-9 items-center justify-center rounded-[4px] font-bold text-xl ${getNumberStyle(index)}`}>
                      {index + 1}
                    </div>
                    
                    <div className="h-16 w-16 overflow-hidden flex-shrink-0">
                      {horse.silks ? (
                        <img src={horse.silks} alt={`${horse.name} silk`} className="h-full w-full object-contain" />
                      ) : (
                        <div className="h-full w-full bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                          <span className="text-[10px] font-medium text-slate-300">Silk</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="truncate text-[17px] font-bold text-slate-900 leading-tight">{horse.name}</h2>
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
            <div className="flex flex-col gap-4 pb-2">
              {/* Highlight Hero Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 p-5 text-white shadow-md shadow-violet-500/15">
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-white border border-white/10">
                      <MapPin className="h-3.5 w-3.5" />
                      {valueOrUnavailable(race?.venue)}
                    </span>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
                      Race {valueOrUnavailable(race?.race_number)}
                    </h2>
                    <p className="mt-1 text-sm text-violet-100/90 font-medium">
                      {valueOrUnavailable(race?.title)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="rounded-xl bg-white/15 backdrop-blur-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white border border-white/20">
                      {valueOrUnavailable(race?.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Field Size Card */}
                <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm border border-slate-100 hover:border-violet-200 transition-all hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 flex-shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Field Size</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5 truncate">
                      {race?.horses?.length ?? race?.field_size ?? 0} Runners
                    </p>
                  </div>
                </div>

                {/* Meeting Date Card */}
                <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm border border-slate-100 hover:border-violet-200 transition-all hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                      {valueOrUnavailable(race?.meeting_date)}
                    </p>
                  </div>
                </div>

                {/* Distance Card */}
                <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm border border-slate-100 hover:border-violet-200 transition-all hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Distance</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5 truncate">
                      {valueOrUnavailable(race?.distance)}
                    </p>
                  </div>
                </div>

                {/* Surface Card */}
                <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm border border-slate-100 hover:border-violet-200 transition-all hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 flex-shrink-0">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Surface</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5 capitalize truncate">
                      {valueOrUnavailable(race?.surface)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Predictor Insights Banner */}
              <div className="rounded-xl bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 p-4 border border-violet-100 flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6A2DF1] text-white flex-shrink-0 mt-0.5">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Predictor Insights</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Select custom factors in the next step to calibrate speed index, draw advantages, and trainer form.
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
