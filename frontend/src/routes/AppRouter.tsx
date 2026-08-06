import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { AnalysisFactorsPage } from "@/pages/AnalysisFactors/AnalysisFactorsPage";
import { HorseDetailsPage } from "@/pages/HorseDetails/HorseDetailsPage";
import { LocationsPage } from "@/pages/Locations/LocationsPage";
import { PredictionResultsPage } from "@/pages/PredictionResults/PredictionResultsPage";
import { RaceHorsesPage } from "@/pages/RaceHorses/RaceHorsesPage";
import { SelectedHorsePage } from "@/pages/SelectedHorse/SelectedHorsePage";
import { VenueRacesPage } from "@/pages/VenueRaces/VenueRacesPage";

export function AppRouter() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LocationsPage />} />
        <Route path="/venues/:venueId" element={<VenueRacesPage />} />
        <Route path="/races/:raceId" element={<RaceHorsesPage />} />
        <Route path="/horses/:horseId" element={<HorseDetailsPage />} />
        <Route path="/analysis/:raceId" element={<AnalysisFactorsPage />} />
        <Route path="/predictions/results" element={<PredictionResultsPage />} />
        <Route path="/predictions/horses/:horseId" element={<SelectedHorsePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
