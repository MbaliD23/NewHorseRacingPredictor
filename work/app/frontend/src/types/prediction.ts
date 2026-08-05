export type PredictionVariable =
  | "trainer_ranking"
  | "jockey_rating"
  | "draw_advantage"
  | "weight"
  | "starting_price"
  | "previous_run";

export type PredictionRequest = {
  race_id: number;
  selected_variables: PredictionVariable[];
};

export type PredictionItem = {
  horse_id: number;
  horse_name: string;
  predicted_position: 1 | 2 | 3;
  overall_score: number;
  confidence_percent: number;
  key_factors: string[];
  strongest_metric?: string | null;
  weakest_metric?: string | null;
  trainer_name?: string | null;
  jockey_name?: string | null;
  draw_number?: number | null;
  weight_value?: number | null;
  starting_price?: number | null;
  previous_run_rating?: number | null;
  notes?: string | null;
};

export type PredictionResponse = {
  race_id: number;
  run_at: string;
  selected_variables: PredictionVariable[];
  predictions: PredictionItem[];
  notes?: string | null;
};

export const predictionVariableLabels: Record<PredictionVariable, string> = {
  trainer_ranking: "Trainer Ranking",
  jockey_rating: "Jockey Rating",
  draw_advantage: "Draw Advantage",
  weight: "Weight",
  starting_price: "Starting Price",
  previous_run: "Previous Run",
};
