export const endpoints = {
  races: "/api/races",
  race: (raceId: number | string) => `/api/races/${raceId}`,
  status: "/api/status/last-updated",
  predictions: "/api/predictions/run",
};
