import { useMemo, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { FilterPills } from "@/components/common/FilterPills";
import { GlassCard } from "@/components/common/GlassCard";
import { BackButton } from "@/components/navigation/BackButton";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { useRaces } from "@/hooks/useRaces";
import { formatDate, formatTime, valueOrUnavailable } from "@/lib/utils";
import { usePredictionStore } from "@/store/predictionStore";

type FilterValue = "all" | "live" | "upcoming";

export function VenueRacesPage() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useRaces();
  const [filter, setFilter] = useState<FilterValue>("all");
  const { currentVenue, setCurrentVenue } = usePredictionStore();
  const venue =
    data?.find((item) => String(item.id) === venueId) ??
    (String(currentVenue?.id) === venueId ? currentVenue : null);

  const races = useMemo(() => {
    return (venue?.races ?? []).filter((race) => {
      return filter === "all" || (filter === "live" && race.is_live) || (filter === "upcoming" && race.is_upcoming);
    });
  }, [filter, venue]);

  const firstRace = venue?.races[0];
  const venueName = venue?.venue ?? "Selected location";
  const formatDisplayDate = (value?: string | Date | null) => {
    const formatted = formatDate(value);
    return formatted === "Unavailable" ? "-" : formatted;
  };
  const formatDisplayTime = (value?: string | Date | null) => {
    const formatted = formatTime(value);
    return formatted === "Unavailable" ? "-" : formatted;
  };
  const displayValue = (value: unknown) => {
    const resolved = valueOrUnavailable(value);
    return resolved === "Unavailable" ? "-" : resolved;
  };

  return (
    <section className="page-section screen-shell min-h-[calc(100vh-96px)] items-stretch text-zinc-950">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#ffffff_0%,#fbf8ff_18%,#f5edff_52%,#ffffff_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[440px] bg-[linear-gradient(90deg,rgba(210,188,255,0.18)_0%,rgba(255,255,255,0)_20%,rgba(194,163,255,0.14)_52%,rgba(255,255,255,0)_80%,rgba(179,144,255,0.22)_100%)]" />

      <div className="mx-auto w-full max-w-[1320px]">
        <div className="overflow-hidden rounded-[36px] border border-violet-200/80 bg-white/78 px-6 py-6 shadow-[0_32px_90px_rgba(35,23,61,0.08)] backdrop-blur-xl md:px-8 md:py-8 lg:px-10">
          <div className="flex flex-col gap-6 border-b border-violet-100/90 pb-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-16 w-16 items-center justify-center rounded-[22px] border border-violet-200 bg-violet-50 text-violet-700 shadow-[0_12px_30px_rgba(109,40,217,0.08)]">
                  <MapPin className="h-10 w-10" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-['Sora'] text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[1.02] text-black">
                    <span className="mr-3 inline-block truncate align-bottom">{venueName}</span>
                    <span className="inline-block text-violet-700">RACES</span>
                  </h1>
                  <p className="mt-3 max-w-2xl text-lg text-zinc-600">
                    Today race and upcoming race information at {venueName}.
                  </p>
                </div>
              </div>
            </div>

            <FilterPills
              value={filter}
              onChange={setFilter}
              selectedVariant="purple"
              className="gap-3"
              activeButtonClassName="border-violet-700 bg-violet-700 text-white shadow-none focus:ring-violet-300/50 focus:ring-offset-0"
              inactiveButtonClassName="border-violet-300 bg-white text-violet-900 shadow-none hover:border-violet-500 hover:bg-violet-50 hover:text-violet-900 focus:ring-violet-300/40 focus:ring-offset-0"
              labels={{ live: "Today Races", upcoming: "Upcoming Races" }}
            />
          </div>

          <AsyncBoundary
            isLoading={isLoading && !venue}
            isError={isError && !venue}
            isEmpty={!venue || races.length === 0}
            emptyMessage="No Races Today."
          >
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {races.map((race) => {
                const availability = race.is_live ? "Today Races" : race.is_upcoming ? "Upcoming Races" : "Scheduled";

                return (
                  <GlassCard
                    key={race.id}
                    className="group relative flex min-h-[336px] flex-col overflow-hidden rounded-[30px] border border-violet-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(242,233,255,0.92))] p-0 shadow-[0_20px_52px_rgba(25,25,35,0.08)]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(196,181,253,0.24),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0))]" />
                    <div className="relative z-10 flex h-full flex-col p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-violet-100 text-violet-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                            <span className="text-xl font-bold leading-none">{race.race_number}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-zinc-500">Date</div>
                            <div className="mt-1 text-lg font-semibold text-zinc-900">
                              {formatDisplayDate(venue?.meeting_date)}
                            </div>
                          </div>
                        </div>
                        <div className="inline-flex rounded-full border border-violet-200 bg-white px-3 py-1 text-sm font-semibold text-violet-700">
                          Race {race.race_number}
                        </div>
                      </div>

                      <div className="mt-6 min-w-0">
                        <h2 className="font-['Sora'] text-[1.85rem] font-bold leading-tight text-zinc-950">
                          {valueOrUnavailable(race.title)}
                        </h2>
                      </div>

                      <div className="mt-6 grid gap-4 border-t border-violet-100 pt-5 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium text-zinc-500">Time</span>
                          <span className="text-right font-semibold text-zinc-900">{formatDisplayTime(race.race_time)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium text-zinc-500">Distance</span>
                          <span className="text-right font-semibold text-zinc-900">
                            {displayValue(race.distance)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium text-zinc-500">Surface</span>
                          <span className="text-right font-semibold text-zinc-900">
                            {displayValue(race.surface)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium text-zinc-500">Availability</span>
                          <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-violet-700">
                            {availability}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium text-zinc-500">Number of runners</span>
                          <span className="text-right font-semibold text-violet-700">
                            {displayValue(race.runners)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto flex justify-end pt-6">
                        <Button
                          variant="outline"
                          className="border-violet-300 bg-white text-zinc-900 shadow-[0_12px_28px_rgba(24,24,27,0.08)] hover:border-violet-700 hover:bg-violet-700 hover:text-white"
                          onClick={() => {
                            setCurrentVenue(venue ?? null);
                            navigate(`/races/${race.id}`);
                          }}
                        >
                          View Horses
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-violet-100/90 pt-6">
              <BackButton
                label="Back to Locations"
                showLabel
                className="border-violet-300 bg-white text-zinc-900 shadow-[0_10px_24px_rgba(24,24,27,0.06)] hover:border-violet-700 hover:bg-violet-50 hover:text-violet-900"
              />
              <Button
                size="lg"
                className="border-0 bg-zinc-950 text-white shadow-[0_18px_40px_rgba(24,24,27,0.16)] hover:bg-violet-800"
                onClick={() => {
                  setCurrentVenue(venue ?? null);
                  if (firstRace) navigate(`/analysis/${firstRace.id}`);
                }}
                disabled={!firstRace}
              >
                Go To Prediction <ArrowRight className="h-6 w-6" />
              </Button>
            </div>
          </AsyncBoundary>
        </div>
      </div>
    </section>
  );
}
