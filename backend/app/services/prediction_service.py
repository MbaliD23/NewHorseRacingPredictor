from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.prediction import Prediction
from app.models.prediction_run import PredictionRun
from app.models.score import Score
from app.models.variable import Variable
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.race_repository import RaceRepository
from app.schemas.prediction import PredictionItem, PredictionResponse
from app.services.scoring import SCORERS
from app.utils.normalization import min_max_normalize


class PredictionService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.race_repo = RaceRepository(session)
        self.prediction_repo = PredictionRepository(session)

    async def run_prediction(
        self, race_id: int, selected_variables: list[str]
    ) -> PredictionResponse:
        if len(selected_variables) != 3:
            raise AppException("Exactly three variables are required.", status_code=422)

        race = await self.race_repo.get_race(race_id)
        if not race:
            raise AppException("Race not found.", status_code=404)

        active_horses = [horse for horse in race.horses if not horse.scratched]
        if len(active_horses) < 3:
            raise AppException(
                "Not enough active horses to produce a Top 3 prediction.",
                status_code=400,
            )

        run = await self.prediction_repo.create_run(
            PredictionRun(
                race_id=race.id,
                run_at=datetime.now(timezone.utc),
                selected_variables=",".join(selected_variables),
                status="completed",
            )
        )

        variable_lookup = {
            item.code: item.id
            for item in (
                await self.session.execute(
                    select(Variable).where(Variable.code.in_(selected_variables))
                )
            )
            .scalars()
            .all()
        }

        per_variable_scores: dict[str, list[float | None]] = {}
        for variable in selected_variables:
            scorer = SCORERS[variable]
            per_variable_scores[variable] = min_max_normalize(
                [scorer.extract_raw_value(horse) for horse in active_horses],
                higher_is_better=scorer.higher_is_better(),
            )

        ranking_rows = []
        for index, horse in enumerate(active_horses):
            available = 0
            weighted_total = 0.0
            components = []

            for variable in selected_variables:
                normalized = per_variable_scores[variable][index]
                raw_value = SCORERS[variable].extract_raw_value(horse)
                if normalized is not None:
                    weighted_total += normalized
                    available += 1
                    components.append((variable, normalized, raw_value))

            completeness = available / len(selected_variables)
            agreement = (
                1
                - (
                    max([value for _, value, _ in components], default=0)
                    - min([value for _, value, _ in components], default=0)
                )
                if components
                else 0
            )
            historical_consistency = 0.5 + (completeness * 0.5)
            confidence = round(
                max(
                    5.0,
                    (
                        completeness * 50
                        + agreement * 25
                        + historical_consistency * 15
                        + (available / 3) * 10
                    ),
                ),
                2,
            )

            strongest = max(components, key=lambda item: item[1])[0] if components else None
            weakest = min(components, key=lambda item: item[1])[0] if components else None
            notes = None
            if completeness < 1:
                notes = "Incomplete extracted data reduced confidence."

            ranking_rows.append(
                {
                    "horse": horse,
                    "score": round(weighted_total / len(selected_variables), 4),
                    "confidence": min(confidence, 99.0),
                    "strongest": strongest,
                    "weakest": weakest,
                    "notes": notes,
                    "components": components,
                }
            )

        ranking_rows.sort(key=lambda item: item["score"], reverse=True)
        predictions = []

        for position, row in enumerate(ranking_rows[:3], start=1):
            prediction = await self.prediction_repo.create_prediction(
                Prediction(
                    prediction_run_id=run.id,
                    horse_id=row["horse"].id,
                    predicted_position=position,
                    overall_score=row["score"],
                    confidence_percent=row["confidence"],
                    strongest_metric=row["strongest"],
                    weakest_metric=row["weakest"],
                    key_factors=", ".join(
                        [f"{code}: {value:.2f}" for code, value, _ in row["components"]]
                    ),
                    notes=row["notes"],
                )
            )

            for variable, normalized, raw_value in row["components"]:
                await self.prediction_repo.create_score(
                    Score(
                        prediction_id=prediction.id,
                        horse_id=row["horse"].id,
                        variable_id=variable_lookup[variable],
                        raw_value=raw_value,
                        normalized_score=normalized,
                        weight=1.0,
                    )
                )

            predictions.append(
                PredictionItem(
                    horse_id=row["horse"].id,
                    horse_name=row["horse"].name,
                    runner_number=row["horse"].runner_number,
                    predicted_position=position,
                    overall_score=row["score"],
                    confidence_percent=row["confidence"],
                    key_factors=[
                        f"{code}: {value:.2f}" for code, value, _ in row["components"]
                    ],
                    strongest_metric=row["strongest"],
                    weakest_metric=row["weakest"],
                    trainer_name=row["horse"].trainer.name if row["horse"].trainer else None,
                    jockey_name=row["horse"].jockey.name if row["horse"].jockey else None,
                    draw_number=row["horse"].draw_number,
                    weight_value=float(row["horse"].weight_value)
                    if row["horse"].weight_value is not None
                    else None,
                    previous_run_rating=float(row["horse"].previous_run_rating)
                    if row["horse"].previous_run_rating is not None
                    else None,
                    trainer_jockey_win_percent=float(row["horse"].trainer_jockey_win_percent)
                    if row["horse"].trainer_jockey_win_percent is not None
                    else None,
                    speed_index=float(row["horse"].speed_index)
                    if row["horse"].speed_index is not None
                    else None,
                    predicted_time=float(row["horse"].predicted_time)
                    if row["horse"].predicted_time is not None
                    else None,
                    notes=row["notes"],
                )
            )

        await self.session.commit()

        return PredictionResponse(
            race_id=race.id,
            run_at=run.run_at,
            selected_variables=selected_variables,
            predictions=predictions,
            notes="Predictions rely only on successfully extracted data from legacy.winningform.co.za. Missing fields reduce confidence.",
        )
