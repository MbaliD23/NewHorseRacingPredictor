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

export type Horse = {
  id: number;
  race_id: number;
  name: string;
  trainer_name: string | null;
  trainer_ranking: number | null;
  jockey_name: string | null;
  jockey_rating: number | null;
  draw_number: number | null;
  weight_value: number | null;
  starting_price: number | null;
  previous_run_rating: number | null;
  scratched: boolean;
  status: string | null;
  notes: string | null;
};
