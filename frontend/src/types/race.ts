export type RaceCard = {
  id: number;
  race_number: number;
  race_time: string | null;
  distance: string | null;
  surface: string | null;
  field_size: number | null;
  status: string | null;
  title: string | null;
  runners: number;
  is_live: boolean;
  is_upcoming: boolean;
};

export type Venue = {
  id: number;
  venue: string;
  meeting_date: string | null;
  races: RaceCard[];
};

export type Race = {
  id: number;
  meeting_id: number;
  venue: string;
  meeting_date: string | null;
  race_number: number;
  race_time: string | null;
  distance: string | null;
  surface: string | null;
  field_size: number | null;
  status: string | null;
  title: string | null;
  horses: Horse[];
};

export type HorseFormEntry = {
  run_date: string | null;
  raw_date_text: string | null;
  track: string | null;
  race_number: string | null;
  distance: string | null;
  jockey_name: string | null;
  weight: string | null;
  draw: string | null;
  finish_position: number | null;
  margin_behind_winner: string | null;
  winner_name: string | null;
  winner_weight: string | null;
  odds: string | null;
  comment: string | null;
  speed_figure: string | null;
  rating: string | null;
  form_summary: string | null;
};

export type Horse = {
  id: number;
  race_id: number;
  name: string;
  runner_number: number | null;
  trainer_name: string | null;
  jockey_name: string | null;
  draw_number: number | null;
  weight_value: number | null;
  previous_run_rating: number | null;
  trainer_jockey_win_percent: number | null;
  speed_index: number | null;
  predicted_time: number | null;
  scratched: boolean;
  status: string | null;
  notes: string | null;
  odds: string | null;
  equipment: string | null;
  merit_rating: number | null;
  pedigree_description: string | null;
  pedigree_line: string | null;
  dob: string | null;
  silks: string | null;
  breeder: string | null;
  owner: string | null;
  total_runs: string | null;
  wet_record: string | null;
  course_record: string | null;
  distance_record: string | null;
  course_distance_record: string | null;
  stakes: string | null;
  sale_price: string | null;
  form_entries: HorseFormEntry[];
};
