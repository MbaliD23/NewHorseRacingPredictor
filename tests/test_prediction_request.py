from app.schemas.prediction import PredictionRequest


def test_prediction_request_accepts_three_variables():
    payload = PredictionRequest(race_id=1, selected_variables=['trainer_ranking', 'jockey_rating', 'weight'])
    assert len(payload.selected_variables) == 3
