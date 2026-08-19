export interface MetricAxis {
  key: string;
  label: string;
}

export interface RawHorse {
  id: number;
  name: string;
  runnerNumber?: number | null;
  color?: string;
  totRns: string;
  forecastOdds: string;
  wet: string;
  crs: string;
  dst: string;
  cd: string;
  meritRating: number;
  jockeyPerf: string;
  trainerPerf: string;
}

export interface NormalizedMetrics {
  totRns: number;
  forecastOdds: number;
  crs: number;
  dst: number;
  cd: number;
  meritRating: number;
  jockeyPerf: number;
  trainerPerf: number;
  [key: string]: number;
}

export interface NormalizedHorse extends RawHorse {
  norm: NormalizedMetrics;
}

export interface ChartScale {
  max: number;
  ticks: number[];
}

export interface TableColumn {
  key: string;
  label: string;
}
