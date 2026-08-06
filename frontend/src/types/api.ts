export type ApiStatus = {
  app_name: string;
  last_scrape_at: string | null;
  last_prediction_at: string | null;
  last_change_detected_at: string | null;
  monitoring_active: boolean;
  source_url: string;
};

export type AsyncStateProps = {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  error?: unknown;
  emptyMessage?: string;
};
