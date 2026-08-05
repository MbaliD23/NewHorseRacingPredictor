import { ArrowRight, BadgeInfo, Scale, Shield, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";
import { BackButton } from "@/components/navigation/BackButton";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { useRace } from "@/hooks/useRace";
import { valueOrUnavailable } from "@/lib/utils";
import { usePredictionStore } from "@/store/predictionStore";
import type { Horse } from "@/types/horse";

const horseFields = [
  ["Trainer", "trainer_name", UserRound],
  ["Trainer Ranking", "trainer_ranking", Shield],
  ["Jockey", "jockey_name", UserRound],
  ["Jockey Rating", "jockey_rating", BadgeInfo],
  ["Draw Advantage", "draw_number", BadgeInfo],
  ["Weight", "weight_value", Scale],
  ["Starting Price", "starting_price", BadgeInfo],
  ["Previous Run", "previous_run_rating", BadgeInfo],
  ["Status", "status", BadgeInfo],
] as const;

export function HorseDetailsPage() {
  const { horseId } = useParams();
  const navigate = useNavigate();
  const { currentHorse, currentRace, setCurrentHorse } = usePredictionStore();
  const raceQuery = useRace(currentHorse?.race_id ?? currentRace?.id);
  const horse = currentHorse ?? raceQuery.data?.horses.find((item) => String(item.id) === horseId) ?? null;

  return (
    <section className="page-section screen-shell items-stretch">
      <div className="horse-detail-head">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary/90">Horse Analysis</p>
          <p className="mt-3 text-lg text-violet-100/80">
            Race {currentRace?.race_number ? `${currentRace.race_number} - ` : ""}
            {currentRace?.title ?? ""}
          </p>
          <h1>{horse?.name ?? "Horse Details"}</h1>
        </div>
      </div>

      <AsyncBoundary
        isLoading={raceQuery.isLoading && !horse}
        isError={raceQuery.isError && !horse}
        isEmpty={!horse}
        emptyMessage="Horse unavailable. The backend does not expose a standalone JSON horse detail endpoint."
      >
        <GlassCard className="horse-detail-card">
          <div className="horse-saddle">{horse?.scratched ? "SCR" : valueOrUnavailable(horse?.draw_number ?? horse?.id)}</div>
          <div>
            <h2>{horse?.name}</h2>
            <p className="mt-2 text-primary">{valueOrUnavailable(horse?.status)}</p>
            <p className="mt-4 max-w-2xl text-violet-100/72">
              Existing horse data, reformatted into a cleaner presentation without changing any backend-fed values or business rules.
            </p>
          </div>
        </GlassCard>

        <div className="detail-grid">
          {horseFields.map(([label, key, Icon]) => (
            <GlassCard key={key} className="detail-tile">
              <Icon className="h-7 w-7 text-violet-300" />
              <div>
                <p>{label}</p>
                <strong>{valueOrUnavailable(horse?.[key as keyof Horse])}</strong>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="page-actions">
          <BackButton label="Back" />
          <Button
            size="lg"
            onClick={() => {
              if (horse) setCurrentHorse(horse);
              navigate(`/analysis/${horse?.race_id ?? currentRace?.id}`);
            }}
            disabled={!horse?.race_id && !currentRace?.id}
          >
            Go To Prediction <ArrowRight className="h-6 w-6" />
          </Button>
        </div>
      </AsyncBoundary>
    </section>
  );
}
