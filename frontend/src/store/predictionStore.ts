import { create } from "zustand";
import type { Horse, Race, Venue } from "@/types/race";
import type { PredictionResponse, PredictionVariable } from "@/types/prediction";

export type HorseOrderBy =
  | "draw_number"
  | "runner_number"
  | "weight"
  | "merit_rating"
  | "predicted_finish"
  | "odds"
  | "horse_name";

type PredictionState = {
  currentVenue: Venue | null;
  currentRace: Race | null;
  currentHorse: Horse | null;
  horseOrderBy: HorseOrderBy;
  selectedVariables: PredictionVariable[];
  predictionResult: PredictionResponse | null;
  isSidebarOpen: boolean;
  setCurrentVenue: (venue: Venue | null) => void;
  setCurrentRace: (race: Race | null) => void;
  setCurrentHorse: (horse: Horse | null) => void;
  setHorseOrderBy: (horseOrderBy: HorseOrderBy) => void;
  setSelectedVariables: (variables: PredictionVariable[]) => void;
  setPredictionResult: (result: PredictionResponse | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  resetFlow: () => void;
};

export const usePredictionStore = create<PredictionState>((set) => ({
  currentVenue: null,
  currentRace: null,
  currentHorse: null,
  horseOrderBy: "draw_number",
  selectedVariables: [],
  predictionResult: null,
  isSidebarOpen: true,
  setCurrentVenue: (currentVenue) => set({ currentVenue }),
  setCurrentRace: (currentRace) => set({ currentRace }),
  setCurrentHorse: (currentHorse) => set({ currentHorse }),
  setHorseOrderBy: (horseOrderBy) => set({ horseOrderBy }),
  setSelectedVariables: (selectedVariables) => set({ selectedVariables }),
  setPredictionResult: (predictionResult) => set({ predictionResult }),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  resetFlow: () =>
    set({
      currentVenue: null,
      currentRace: null,
      currentHorse: null,
      horseOrderBy: "draw_number",
      selectedVariables: [],
      predictionResult: null,
    }),
}));
