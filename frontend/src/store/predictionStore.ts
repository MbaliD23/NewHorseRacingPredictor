import { create } from "zustand";
import type { Horse, Race, Venue } from "@/types/race";
import type { PredictionResponse, PredictionVariable } from "@/types/prediction";

type PredictionState = {
  currentVenue: Venue | null;
  currentRace: Race | null;
  currentHorse: Horse | null;
  selectedVariables: PredictionVariable[];
  predictionResult: PredictionResponse | null;
  setCurrentVenue: (venue: Venue | null) => void;
  setCurrentRace: (race: Race | null) => void;
  setCurrentHorse: (horse: Horse | null) => void;
  setSelectedVariables: (variables: PredictionVariable[]) => void;
  setPredictionResult: (result: PredictionResponse | null) => void;
  resetFlow: () => void;
};

export const usePredictionStore = create<PredictionState>((set) => ({
  currentVenue: null,
  currentRace: null,
  currentHorse: null,
  selectedVariables: [],
  predictionResult: null,
  setCurrentVenue: (currentVenue) => set({ currentVenue }),
  setCurrentRace: (currentRace) => set({ currentRace }),
  setCurrentHorse: (currentHorse) => set({ currentHorse }),
  setSelectedVariables: (selectedVariables) => set({ selectedVariables }),
  setPredictionResult: (predictionResult) => set({ predictionResult }),
  resetFlow: () =>
    set({
      currentVenue: null,
      currentRace: null,
      currentHorse: null,
      selectedVariables: [],
      predictionResult: null,
    }),
}));
