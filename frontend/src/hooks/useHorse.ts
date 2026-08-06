import { useQuery } from "@tanstack/react-query";
import { getHorse } from "@/services/horseService";

export function useHorse(horseId?: number | string) {
  return useQuery({
    queryKey: ["horse", horseId],
    queryFn: () => getHorse(horseId!),
    enabled: false,
    initialData: null,
  });
}
