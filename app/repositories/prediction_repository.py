from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload

from app.models.prediction import Prediction
from app.models.prediction_run import PredictionRun
from app.models.score import Score
from app.repositories.base import BaseRepository


class PredictionRepository(BaseRepository):
    async def create_run(self, run: PredictionRun) -> PredictionRun:
        self.session.add(run)
        await self.session.flush()
        return run

    async def create_prediction(self, prediction: Prediction) -> Prediction:
        self.session.add(prediction)
        await self.session.flush()
        return prediction

    async def create_score(self, score: Score) -> Score:
        self.session.add(score)
        await self.session.flush()
        return score

    async def latest_run_for_race(self, race_id: int) -> PredictionRun | None:
        result = await self.session.execute(
            select(PredictionRun)
            .where(PredictionRun.race_id == race_id)
            .options(selectinload(PredictionRun.predictions).selectinload(Prediction.horse))
            .order_by(PredictionRun.run_at.desc())
        )
        return result.scalars().first()

    async def delete_scores_for_run(self, run_id: int) -> None:
        await self.session.execute(delete(Score).where(Score.prediction_id.in_(select(Prediction.id).where(Prediction.prediction_run_id == run_id))))
