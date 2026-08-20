import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock, MapPin, Sparkles, Trophy, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { GlassCard } from "@/components/common/GlassCard";
import { FilterPills, type FilterValue } from "@/components/common/FilterPills";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { BackButton } from "@/components/navigation/BackButton";
import { useRaces } from "@/hooks/useRaces";
import { formatDate, formatTime, valueOrUnavailable } from "@/lib/utils";
import { usePredictionStore } from "@/store/predictionStore";
import greyvilleImg from "@/assets/greyville.png";
import turfonteinImg from "@/assets/Turffontein.png";
import kenilworthImg from "@/assets/Kenilworth.png";
import scotsvilleImg from "@/assets/Scottsville.png";
import fairviewImg from "@/assets/fairview.png";
import vaalImg from "@/assets/Vaal.png";

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

export function VenueRacesPage() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useRaces();
  const [filter, setFilter] = useState<FilterValue>("all");
  const { currentVenue, setCurrentVenue } = usePredictionStore();
  const venue =
    data?.find((item) => String(item.id) === venueId) ?? (String(currentVenue?.id) === venueId ? currentVenue : null);

  const races = useMemo(() => {
    return (venue?.races ?? []).filter((race) => {
      return (
        filter === "all" ||
        (filter === "today" && (race.is_live || !race.is_upcoming)) ||
        (filter === "upcoming" && race.is_upcoming)
      );
    });
  }, [filter, venue]);

  const liveCount = venue?.races.filter((race) => race.is_live).length ?? 0;
  const upcomingCount = venue?.races.filter((race) => race.is_upcoming).length ?? 0;
  const totalRaces = venue?.races.length ?? 0;

  const rawVenueName = venue?.venue ?? "Selected Event";
  const venueTitle = rawVenueName.toLowerCase().endsWith("races") ? rawVenueName : `${rawVenueName} Races`;

  return (
    <section className="page-section screen-shell w-full gap-6 py-4">
      <AsyncBoundary
        isLoading={isLoading && !venue}
        isError={isError && !venue}
        isEmpty={!venue}
        emptyMessage="Event unavailable."
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-2 sm:px-4 lg:px-6">
          {/* Header Card */}
          <div className="rounded-[32px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <BackButton to="/" fallbackTo="/" label="Back to Events" />
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6A2DF1] flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(venue?.meeting_date)}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">
                  {totalRaces} races
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">
                  {upcomingCount} upcoming
                </span>
                {liveCount > 0 && (
                  <div className="ml-auto flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#6A2DF1] uppercase">
                    <div className="h-2 w-2 rounded-full bg-[#6A2DF1] animate-pulse" />
                    {liveCount} Live
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#6A2DF1]/80">
                Venue dossier
              </p>
              <h1 className="text-[clamp(1.85rem,3.2vw,3.2rem)] font-black leading-[1.02] tracking-tight text-slate-950">
                {venueTitle}
              </h1>
            </div>
          </div>

          {/* Hero Banner Card - Single cohesive venue overview */}
          <GlassCard className="group overflow-hidden rounded-[1.4rem] border-slate-100 bg-white text-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:ring-[2px] hover:ring-purple-600/60 hover:shadow-[0_12px_40px_rgba(106,45,241,0.12)]">
            <div className="relative h-40 overflow-hidden bg-slate-100 sm:h-52">
              <img
                src={getVenueImage(venue?.venue)}
                alt={venueTitle}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 sm:left-6 sm:right-6">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-purple-200">
                  Event Overview
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">{venueTitle}</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 bg-white p-4 sm:p-5">
              <InfoTile icon={CalendarDays} label="Meeting date" value={formatDate(venue?.meeting_date)} />
              <InfoTile icon={MapPin} label="Venue" value={valueOrUnavailable(venue?.venue)} />
              <InfoTile icon={Trophy} label="Total races" value={String(totalRaces)} />
              <InfoTile icon={Sparkles} label="Live now" value={String(liveCount)} />
            </div>
          </GlassCard>

          {/* Filter Bar Card */}
          <div className="rounded-[28px] border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Filter Races
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Select a race filter or browse all scheduled races below.
                </p>
              </div>
              <FilterPills value={filter} onChange={setFilter} />
            </div>
          </div>

          {/* Races List */}
          <AsyncBoundary isEmpty={races.length === 0} emptyMessage="No races available for this filter.">
            <div className="flex flex-col gap-4 pb-4">
              {races.map((race) => (
                <div
                  key={race.id}
                  className="group grid cursor-pointer gap-4 rounded-[26px] border border-slate-200 bg-white p-4 sm:p-5 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 hover:bg-slate-900/80 hover:backdrop-blur-md hover:border-purple-600 hover:ring-[3px] hover:ring-purple-600 hover:shadow-[0_12px_40px_rgb(0,0,0,0.25)] hover:-translate-y-1 xl:grid-cols-[auto_minmax(0,1.8fr)_repeat(4,minmax(100px,0.7fr))_auto] xl:items-center"
                  onClick={() => {
                    setCurrentVenue(venue ?? null);
                    navigate(`/races/${race.id}`);
                  }}
                >
                  {/* Race Index Badge: Exact purple accent matching Explore button */}
                  <div className="flex flex-col items-center justify-center min-w-[76px] sm:min-w-[88px] px-3 py-2 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-500/40 shrink-0 group-hover:shadow-[0_0_18px_rgba(147,51,234,0.6)] group-hover:border-purple-400 transition-all duration-300">
                    <span className="text-[10px] font-black tracking-widest uppercase text-purple-100/90 leading-none">
                      RACE
                    </span>
                    <span className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white">
                      {String(race.race_number ?? 0).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Race Title & Status Indicators */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-[17px] font-black leading-tight text-slate-950 group-hover:text-white transition-colors duration-300 sm:text-[19px]">
                        {valueOrUnavailable(race.title)}
                      </h2>
                      {race.is_live ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-300 shadow-xs group-hover:bg-emerald-950/60 group-hover:text-emerald-300 group-hover:border-emerald-500/40 transition-colors duration-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                          Live
                        </span>
                      ) : race.is_upcoming ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200 group-hover:bg-purple-950/60 group-hover:text-purple-300 group-hover:border-purple-500/40 transition-colors duration-300">
                          <Clock className="h-3 w-3 text-purple-600 group-hover:text-purple-300" />
                          Upcoming
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200 group-hover:bg-white/10 group-hover:text-slate-300 group-hover:border-white/15 transition-colors duration-300">
                          Scheduled
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 group-hover:text-slate-400 transition-colors duration-300">
                      <span>{valueOrUnavailable(venue?.venue)}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-[#6A2DF1] group-hover:text-purple-400 font-bold transition-colors duration-300">
                        <Users className="h-3.5 w-3.5" />
                        {valueOrUnavailable(race.runners)} Runners
                      </span>
                    </div>
                  </div>

                  {/* Metadata Tiles */}
                  <InfoColumn label="Post Time" value={formatTime(race.race_time)} />
                  <InfoColumn label="Distance" value={valueOrUnavailable(race.distance)} />
                  <InfoColumn label="Surface" value={valueOrUnavailable(race.surface)} />
                  <InfoColumn label="Field Size" value={`${valueOrUnavailable(race.runners)} runners`} />

                  {/* CTA Action Button */}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-purple-50 border border-purple-200 px-4 py-2.5 text-xs font-bold text-[#6A2DF1] transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-500 group-hover:shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] active:scale-[0.98] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentVenue(venue ?? null);
                      navigate(`/races/${race.id}`);
                    }}
                  >
                    Explore Race
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </AsyncBoundary>
        </div>
      </AsyncBoundary>
    </section>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 sm:p-4">
      <Icon className="h-5 w-5 text-[#6A2DF1]" />
      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-0.5 text-base sm:text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function InfoColumn({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 group-hover:text-purple-300/80 transition-colors duration-300">{label}</p>
      <p className="mt-1 text-[15px] font-bold text-slate-950 group-hover:text-white transition-colors duration-300">{value}</p>
    </div>
  );
}
