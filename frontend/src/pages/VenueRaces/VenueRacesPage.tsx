import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, Clock3, MapPin, Sparkles, Trophy, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { FilterPills } from "@/components/common/FilterPills";
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
    data?.find((item) => String(item.id) === venueId) ?? (String(currentVenue?.id) === venueId ? currentVenue : null);

  const races = useMemo(() => {
    return (venue?.races ?? []).filter((race) => {
      return filter === "all" || (filter === "live" && race.is_live) || (filter === "upcoming" && race.is_upcoming);
    });
  }, [filter, venue]);

  const firstRace = venue?.races[0];
  const liveCount = venue?.races.filter((race) => race.is_live).length ?? 0;
  const upcomingCount = venue?.races.filter((race) => race.is_upcoming).length ?? 0;
  const totalRaces = venue?.races.length ?? 0;

  return (
    <section className="page-section screen-shell venue-races-page light-theme items-stretch">
      <div className="page-heading page-heading-wide races-heading light-heading">
        <h1>Races</h1>
        <p className="selected-location">{venue?.venue ?? "Selected location"}</p>
        <p>Live and upcoming race cards with tighter spacing, faster scanability, and cleaner action alignment.</p>
      </div>

      <div className="races-hero-card">
        <div className="races-hero-copy">
          <div className="races-hero-kicker">
            <MapPin className="h-4 w-4" />
            <span>Venue overview</span>
          </div>
          <h2>{venue?.venue ?? "Selected location"}</h2>
          <p>
            Browse the full card at a glance, then jump straight into horses or prediction flow without losing the
            page context.
          </p>
        </div>

        <div className="races-hero-stats">
          <HeroStat label="Meeting date" value={formatDate(venue?.meeting_date)} icon={<CalendarDays className="h-4 w-4" />} />
          <HeroStat label="Total races" value={String(totalRaces)} icon={<Trophy className="h-4 w-4" />} />
          <HeroStat label="Live now" value={String(liveCount)} icon={<Sparkles className="h-4 w-4" />} />
          <HeroStat label="Upcoming" value={String(upcomingCount)} icon={<Clock3 className="h-4 w-4" />} />
        </div>
      </div>

      <div className="races-toolbar">
        <div className="status-strip status-strip-light">
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
        <div className="race-list race-list--premium">
          {races.map((race) => (
            <article
              key={race.id}
              className={`race-row race-row-premium race-row-light ${
                race.is_live ? "race-row-live" : race.is_upcoming ? "race-row-upcoming" : ""
              }`}
              role="button"
              tabIndex={0}
              onClick={() => {
                setCurrentVenue(venue ?? null);
                navigate(`/races/${race.id}`);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setCurrentVenue(venue ?? null);
                  navigate(`/races/${race.id}`);
                }
              }}
            >
              <div className="race-number race-number-light">
                <span>{race.race_number}</span>
              </div>

              <div className="race-row-copy">
                <div className="race-row-topline">
                  <span className="race-date-chip">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(venue?.meeting_date)}
                  </span>
                  <span
                    className={`race-status-chip ${
                      race.is_live ? "race-status-chip-live" : race.is_upcoming ? "race-status-chip-upcoming" : ""
                    }`}
                  >
                    {race.is_live ? "Live" : race.is_upcoming ? "Upcoming" : "Scheduled"}
                  </span>
                </div>

                <div className="race-row-heading">
                  <div className="min-w-0">
                    <div className="race-number-label">Race {race.race_number}</div>
                    <h2 className="truncate">{valueOrUnavailable(race.title)}</h2>
                  </div>
                  <span className="race-field-pill">
                    <Users className="h-3.5 w-3.5" />
                    {valueOrUnavailable(race.runners)} runners
                  </span>
                </div>

                <div className="race-meta-grid">
                  <RaceMeta label="Post time" value={formatTime(race.race_time)} />
                  <RaceMeta label="Distance" value={valueOrUnavailable(race.distance)} />
                  <RaceMeta label="Surface" value={valueOrUnavailable(race.surface)} />
                  <RaceMeta label="Status" value={valueOrUnavailable(race.status)} />
                </div>
              </div>

              <div className="race-row-action">
                <Button
                  variant="outline"
                  onClick={(event) => {
                    event.stopPropagation();
                    setCurrentVenue(venue ?? null);
                    navigate(`/races/${race.id}`);
                  }}
                >
                  View Horses
                </Button>
              </div>
            </article>
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

function HeroStat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="races-hero-stat">
      <div className="races-hero-stat-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function RaceMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="race-meta-tile">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
