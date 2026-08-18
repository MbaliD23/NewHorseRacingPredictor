import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { FilterPills } from "@/components/common/FilterPills";
import { GlassCard } from "@/components/common/GlassCard";
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
  const venue = data?.find((item) => String(item.id) === venueId) ?? (String(currentVenue?.id) === venueId ? currentVenue : null);

  const races = useMemo(() => {
    return (venue?.races ?? []).filter((race) => {
      return filter === "all" || (filter === "live" && race.is_live) || (filter === "upcoming" && race.is_upcoming);
    });
  }, [filter, venue]);

  const firstRace = venue?.races[0];

  return (
    <section className="page-section screen-shell items-stretch">
      <div className="page-heading page-heading-wide races-heading">
        <h1>Races</h1>
        <p className="selected-location">{venue?.venue ?? "Selected location"}</p>
        <p>Live and upcoming race cards with tighter spacing, faster scanability, and cleaner action alignment.</p>
      </div>

      <div className="toolbar-row toolbar-row-start">
        <div className="status-strip">
          <CalendarDays className="h-4 w-4 text-primary" />
          {formatDate(venue?.meeting_date)}
        </div>
        <FilterPills value={filter} onChange={setFilter} />
      </div>

      <AsyncBoundary
        isLoading={isLoading && !venue}
        isError={isError && !venue}
        isEmpty={!venue || races.length === 0}
        emptyMessage="No venue race data is available from the backend."
      >
        <div className="race-list">
          {races.map((race) => (
            <GlassCard key={race.id} className="race-row race-row-premium">
              <div className="race-number">{race.race_number}</div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2 text-sm text-violet-100/70">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(venue?.meeting_date)}
                </div>
                <div className="text-xs uppercase tracking-[0.22em] text-primary/90">Race {race.race_number}</div>
                <h2 className="truncate text-2xl font-bold">{valueOrUnavailable(race.title)}</h2>
                <p className="text-violet-100/75">
                  {formatTime(race.race_time)} <span className="mx-2">•</span>
                  {valueOrUnavailable(race.distance)} <span className="mx-2">•</span>
                  {valueOrUnavailable(race.surface)}
                </p>
                <p className="text-sm text-violet-100/60">{valueOrUnavailable(race.runners)} Runners</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentVenue(venue ?? null);
                  navigate(`/races/${race.id}`);
                }}
              >
                View Horses
              </Button>
            </GlassCard>
          ))}
        </div>
        <div className="page-actions">
          <Button
            size="lg"
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
    </section>
  );
}
