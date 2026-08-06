export type PredictionVariable =
  | "draw_advantage"
  | "weight"
  | "previous_run"
  | "trainer_jockey_win_percent"
  | "speed_index"
  | "predicted_time";

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
  previous_run_rating?: number | null;
  trainer_jockey_win_percent?: number | null;
  speed_index?: number | null;
  predicted_time?: number | null;
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
  draw_advantage: "Draw Advantage",
  weight: "Weight",
  previous_run: "Previous Run",
  trainer_jockey_win_percent: "Trainer/Jockey Combination",
  speed_index: "Speed Index",
  predicted_time: "Predicted Time",
};
