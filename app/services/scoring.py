from dataclasses import dataclass

from app.interfaces.scorer import IVariableScorer


@dataclass
class TrainerRankingScore(IVariableScorer):
    code: str = 'trainer_ranking'
    display_name: str = 'Trainer Ranking'
    def extract_raw_value(self, horse): return float(horse.trainer.ranking) if horse.trainer and horse.trainer.ranking is not None else None
    def higher_is_better(self) -> bool: return True


@dataclass
class JockeyScore(IVariableScorer):
    code: str = 'jockey_rating'
    display_name: str = 'Jockey Rating'
    def extract_raw_value(self, horse): return float(horse.jockey.rating) if horse.jockey and horse.jockey.rating is not None else None
    def higher_is_better(self) -> bool: return True


@dataclass
class DrawScore(IVariableScorer):
    code: str = 'draw_advantage'
    display_name: str = 'Draw Advantage'
    def extract_raw_value(self, horse): return float(horse.draw_number) if horse.draw_number is not None else None
    def higher_is_better(self) -> bool: return False


@dataclass
class WeightScore(IVariableScorer):
    code: str = 'weight'
    display_name: str = 'Weight'
    def extract_raw_value(self, horse): return float(horse.weight_value) if horse.weight_value is not None else None
    def higher_is_better(self) -> bool: return False


@dataclass
class StartingPriceScore(IVariableScorer):
    code: str = 'starting_price'
    display_name: str = 'Starting Price'
    def extract_raw_value(self, horse): return float(horse.starting_price) if horse.starting_price is not None else None
    def higher_is_better(self) -> bool: return False


@dataclass
class PreviousRunScore(IVariableScorer):
    code: str = 'previous_run'
    display_name: str = 'Previous Run'
    def extract_raw_value(self, horse): return float(horse.previous_run_rating) if horse.previous_run_rating is not None else None
    def higher_is_better(self) -> bool: return True


SCORERS = {
    'trainer_ranking': TrainerRankingScore(),
    'jockey_rating': JockeyScore(),
    'draw_advantage': DrawScore(),
    'weight': WeightScore(),
    'starting_price': StartingPriceScore(),
    'previous_run': PreviousRunScore(),
}
