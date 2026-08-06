import { axiosClient } from "@/api/axiosClient";
import { endpoints } from "@/api/endpoints";
import type { PredictionRequest, PredictionResponse } from "@/types/prediction";

export async function runPrediction(payload: PredictionRequest) {
  const { data } = await axiosClient.post<PredictionResponse>(endpoints.predictions, payload);
  return data;
}
