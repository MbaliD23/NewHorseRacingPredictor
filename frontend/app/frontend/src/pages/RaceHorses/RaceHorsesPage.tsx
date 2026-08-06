import { useState } from "react";
import { ArrowRight, Clock, Info, Sprout } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";
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
  const { currentHorse, setCurrentRace, setCurrentHorse } = usePredictionStore();

  return (
    <section className="page-section screen-shell items-stretch">
      <div className="hero-panel">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Race {race?.race_number ?? ""}</p>
          <h1 className="hero-title">{valueOrUnavailable(race?.title)}</h1>
          <div className="mt-4 flex flex-wrap gap-5 text-lg text-violet-50/80">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-5 w-5" /> {formatTime(race?.race_time)}
            </span>
            <span>{valueOrUnavailable(race?.distance)}</span>
            <span className="inline-flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-400" /> {valueOrUnavailable(race?.surface)}
            </span>
          </div>
        </div>
      </div>

      <AsyncBoundary isLoading={isLoading} isError={isError} isEmpty={!race} emptyMessage="Race unavailable.">
        <div className="tabs">
          <button className={tab === "horses" ? "active" : ""} onClick={() => setTab("horses")}>
            Horses
          </button>
          <button className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>
            <Info className="h-5 w-5" /> Race Info
          </button>
        </div>

        {tab === "horses" ? (
          <AsyncBoundary isEmpty={(race?.horses ?? []).length === 0} emptyMessage="No horses available.">
            <div className="horse-list">
              {race?.horses.map((horse, index) => (
                <GlassCard
                  key={horse.id}
                  className={`horse-row horse-row-premium ${currentHorse?.id === horse.id ? "selected" : ""}`}
                  onClick={() => {
                    setCurrentRace(race ?? null);
                    setCurrentHorse(horse);
                    navigate(`/horses/${horse.id}`);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setCurrentRace(race ?? null);
                      setCurrentHorse(horse);
                      navigate(`/horses/${horse.id}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="horse-number">{index + 1}</div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-2xl font-bold">{horse.name}</h2>
                    <p className="text-violet-100/78">
                      Trainer: {valueOrUnavailable(horse.trainer_name)}
                      <span className="mx-3">|</span>
                      Jockey: {valueOrUnavailable(horse.jockey_name)}
                    </p>
                    <p className="mt-2 text-sm uppercase text-primary">{valueOrUnavailable(horse.status)}</p>
                  </div>
                  <Button variant="outline" className="pointer-events-none">
                    View Analysis <ArrowRight className="h-5 w-5" />
                  </Button>
                </GlassCard>
              ))}
            </div>
            <button className="full-field" type="button">
              View Full Field ({race?.horses.length ?? 0} Horses)
            </button>
            <div className="page-actions">
              <BackButton label="Back" />
              <Button size="lg" onClick={() => navigate(`/analysis/${race?.id}`)}>
                Go To Prediction <ArrowRight className="h-6 w-6" />
              </Button>
            </div>
          </AsyncBoundary>
        ) : (
          <GlassCard className="grid gap-3 p-6 text-lg text-violet-100/80 md:grid-cols-2">
            <p>Venue: {valueOrUnavailable(race?.venue)}</p>
            <p>Status: {valueOrUnavailable(race?.status)}</p>
            <p>Race Number: {valueOrUnavailable(race?.race_number)}</p>
            <p>Number Of Runners: {valueOrUnavailable(race?.horses.length)}</p>
            <p>Field Size: {valueOrUnavailable(race?.field_size)}</p>
            <p>Meeting Date: {valueOrUnavailable(race?.meeting_date)}</p>
          </GlassCard>
        )}
      </AsyncBoundary>
    </section>
  );
}
