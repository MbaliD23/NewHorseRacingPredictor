from dataclasses import dataclass

from app.interfaces.scorer import IVariableScorer


@dataclass
class TrainerJockeyCombinationScore(IVariableScorer):
    code: str = 'trainer_jockey_win_percent'
    display_name: str = 'Trainer/Jockey Combination Win %'
    def extract_raw_value(self, horse): return float(horse.trainer_jockey_win_percent) if horse.trainer_jockey_win_percent is not None else None
    def higher_is_better(self) -> bool: return True


@dataclass
class SpeedIndexScore(IVariableScorer):
    code: str = 'speed_index'
    display_name: str = 'Speed Index'
    def extract_raw_value(self, horse): return float(horse.speed_index) if horse.speed_index is not None else None
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
class PredictedTimeScore(IVariableScorer):
    code: str = 'predicted_time'
    display_name: str = 'Predicted Time'
    def extract_raw_value(self, horse): return float(horse.predicted_time) if horse.predicted_time is not None else None
    def higher_is_better(self) -> bool: return False


@dataclass
class PreviousRunScore(IVariableScorer):
    code: str = 'previous_run'
    display_name: str = 'Previous Run'
    def extract_raw_value(self, horse): return float(horse.previous_run_rating) if horse.previous_run_rating is not None else None
    def higher_is_better(self) -> bool: return False


SCORERS = {
    'draw_advantage': DrawScore(),
    'weight': WeightScore(),
    'previous_run': PreviousRunScore(),
    'trainer_jockey_win_percent': TrainerJockeyCombinationScore(),
    'speed_index': SpeedIndexScore(),
    'predicted_time': PredictedTimeScore(),
}
