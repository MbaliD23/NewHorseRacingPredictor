import { useMutation } from "@tanstack/react-query";
import { runPrediction } from "@/services/predictionService";

export function usePrediction() {
  return useMutation({
    mutationFn: runPrediction,
  });
}
