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
    <section className="page-section screen-shell venues-page min-h-[calc(100vh-96px)] text-zinc-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_55%),linear-gradient(180deg,#ffffff_0%,#fcf7ff_42%,#ffffff_100%)]" />

      <div className="page-heading page-heading-wide rounded-[36px] border border-violet-200/70 bg-white/88 px-6 py-8 shadow-[0_24px_80px_rgba(15,15,15,0.08)] backdrop-blur-xl md:px-10 md:py-10">
        <div className="mx-auto mb-4 inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-violet-700">
          Venues
        </div>
        <h1 className="text-zinc-950">
          Select Your <span>Location</span>
        </h1>
        <p className="max-w-3xl text-zinc-700">
          Pick a race track to explore today&apos;s meetings, live runners, and prediction-ready cards.
        </p>
      </div>

      <div className="toolbar-row rounded-[32px] border border-violet-200/70 bg-white/92 px-4 py-4 shadow-[0_20px_60px_rgba(15,15,15,0.06)] backdrop-blur-xl md:px-5">
        <label className="search-box border-violet-200/80 bg-violet-50/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]">
          <Search className="h-5 w-5 text-violet-700" />
          <input
            className="text-zinc-950 placeholder:text-zinc-500"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search location..."
          />
        </label>
        <div className="flex flex-wrap items-center gap-3 [&_button]:border-violet-200 [&_button]:text-zinc-800 [&_button]:shadow-none [&_button]:focus:ring-violet-500/50 [&_button]:focus:ring-offset-white [&_button]:disabled:opacity-45 [&_button:hover]:border-violet-400 [&_button:hover]:text-violet-800 [&_.border-primary\\/60]:border-violet-600 [&_.border-primary\\/60]:bg-violet-600 [&_.border-primary\\/60]:text-white [&_.border-primary\\/60]:shadow-[0_14px_30px_rgba(139,92,246,0.24)] [&_.border-white\\/12]:bg-white [&_.border-white\\/12]:text-zinc-700 [&_.border-white\\/12:hover]:bg-violet-50">
          <FilterPills value={filter} onChange={setFilter} />
        </div>
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
                className="venue-card border border-violet-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,245,255,0.96))] shadow-[0_24px_64px_rgba(15,15,15,0.08)]"
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
                  <div className="flex items-center gap-3 text-2xl font-bold text-zinc-950">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                      <MapPin className="h-6 w-6" />
                    </div>
                    {venue.venue}
                  </div>
                  <dl className="mt-5 grid gap-3 text-sm text-zinc-600">
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-zinc-600">Meeting Date</dt>
                      <dd className="text-right font-semibold text-zinc-950">{formatDate(venue.meeting_date)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-violet-100 pt-3">
                      <dt className="font-medium text-zinc-600">Number of Races</dt>
                      <dd className="text-right font-semibold text-violet-700">{venue.races.length}</dd>
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
                  className="venue-card-action border-0 bg-zinc-950 text-white shadow-[0_14px_28px_rgba(24,24,27,0.18)] hover:bg-violet-700 hover:text-white"
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
