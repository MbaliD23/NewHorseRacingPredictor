import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { FilterPills } from "@/components/common/FilterPills";
import { GlassCard } from "@/components/common/GlassCard";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { useRaces } from "@/hooks/useRaces";
import { formatDate } from "@/lib/utils";
import { usePredictionStore } from "@/store/predictionStore";

type FilterValue = "all" | "live" | "upcoming";

export function LocationsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useRaces();
  const { setCurrentVenue, resetFlow } = usePredictionStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  const venues = useMemo(() => {
    return (data ?? []).filter((venue) => {
      const matchesQuery = venue.venue.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "live" && venue.races.some((race) => race.is_live)) ||
        (filter === "upcoming" && venue.races.some((race) => race.is_upcoming));
      return matchesQuery && matchesFilter;
    });
  }, [data, filter, query]);

  function openVenue(venue: (typeof venues)[number]) {
    resetFlow();
    setCurrentVenue(venue);
    navigate(`/venues/${venue.id}`);
  }

  return (
    <section className="page-section screen-shell">
      <div className="page-heading page-heading-wide">
        <h1>
          Select Your <span>Location</span>
        </h1>
        <p>Pick a race track to explore today&apos;s meetings, live runners, and prediction-ready cards.</p>
      </div>

      <div className="toolbar-row">
        <label className="search-box">
          <Search className="h-5 w-5 text-violet-200/75" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search location..." />
        </label>
        <FilterPills value={filter} onChange={setFilter} />
      </div>

      <AsyncBoundary
        isLoading={isLoading}
        isError={isError}
        isEmpty={venues.length === 0}
        emptyMessage="No venue data is available from the backend."
      >
        <div className="venue-grid">
          {venues.map((venue, index) => (
            <motion.article
              key={venue.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
            >
              <GlassCard
                className="venue-card"
                onClick={() => openVenue(venue)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openVenue(venue);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open ${venue.venue}`}
              >
                <div className="venue-card-content">
                  <div className="flex items-center gap-3 text-2xl font-bold text-white">
                    <MapPin className="h-7 w-7 text-primary" />
                    {venue.venue}
                  </div>
                  <dl className="mt-5 grid gap-2 text-sm text-violet-100/72">
                    <div className="flex justify-between gap-4">
                      <dt>Meeting Date</dt>
                      <dd className="text-right text-white">{formatDate(venue.meeting_date)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Number of Races</dt>
                      <dd className="text-right text-white">{venue.races.length}</dd>
                    </div>
                  </dl>
                </div>
                <Button
                  size="icon"
                  aria-label={`Open ${venue.venue}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    openVenue(venue);
                  }}
                  className="venue-card-action"
                >
                  <ArrowRight className="h-7 w-7" />
                </Button>
              </GlassCard>
            </motion.article>
          ))}
        </div>
      </AsyncBoundary>
    </section>
  );
}
