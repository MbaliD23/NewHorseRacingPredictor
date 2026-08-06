import { useQuery } from "@tanstack/react-query";
import { getRace } from "@/services/raceService";

export function useRace(raceId?: number | string) {
  return useQuery({
    queryKey: ["race", raceId],
    queryFn: () => getRace(raceId!),
    enabled: Boolean(raceId),
  });
}
