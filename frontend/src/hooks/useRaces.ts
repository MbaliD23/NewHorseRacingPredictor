import { useQuery } from "@tanstack/react-query";
import { getRaces } from "@/services/raceService";

export function useRaces() {
  return useQuery({
    queryKey: ["races"],
    queryFn: getRaces,
    retry: false,
  });
}
