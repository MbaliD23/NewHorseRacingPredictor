import { useMemo, useState } from "react";
import { Search, MapPin, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilterPills } from "@/components/common/FilterPills";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { useRaces } from "@/hooks/useRaces";
import { usePredictionStore } from "@/store/predictionStore";

import horseBg from "@/assets/whitecornerhorse.png";
import horseIcon from "@/assets/horseicon.png";
import wfLogo from "@/assets/wflogo.png";
import greyvilleImg from "@/assets/greyville.png";
import turfonteinImg from "@/assets/Turffontein.png";
import kenilworthImg from "@/assets/Kenilworth.png";
import scotsvilleImg from "@/assets/Scottsville.png";
import fairviewImg from "@/assets/fairview.png";
import vaalImg from "@/assets/Vaal.png";

const getVenueImage = (venueName: string) => {
  const name = venueName.toLowerCase();
  if (name.includes("greyville")) return greyvilleImg;
  if (name.includes("turffontein")) return turfonteinImg;
  if (name.includes("kenilworth")) return kenilworthImg;
  if (name.includes("scottsville")) return scotsvilleImg;
  if (name.includes("fairview")) return fairviewImg;
  if (name.includes("vaal")) return vaalImg;
  return greyvilleImg;
};

const formatVenueDate = (dateStr: string | null) => {
  let dateObj = new Date();
  if (dateStr) {
    const [year, month, day] = dateStr.split("-");
    dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  }
  return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

type FilterValue = "all" | "live" | "upcoming";

export function LocationsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useRaces();
  const { setCurrentVenue, resetFlow } = usePredictionStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [hoveredVenueId, setHoveredVenueId] = useState<number | null>(null);

  const venues = useMemo(() => {
    const filtered = (data ?? []).filter((venue) => {
      const matchesQuery = venue.venue.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "live" && venue.races.some((race) => race.is_live)) ||
        (filter === "upcoming" && venue.races.some((race) => race.is_upcoming));
      return matchesQuery && matchesFilter;
    });

    return filtered.sort((a, b) => {
      const aHasActive = a.races.some(r => r.is_live || r.is_upcoming);
      const bHasActive = b.races.some(r => r.is_live || r.is_upcoming);
      
      if (aHasActive && !bHasActive) return -1;
      if (!aHasActive && bHasActive) return 1;

      const dateA = a.meeting_date ? new Date(a.meeting_date).getTime() : 0;
      const dateB = b.meeting_date ? new Date(b.meeting_date).getTime() : 0;
      if (dateA !== dateB) {
        return dateB - dateA; // newest first
      }
      return a.venue.localeCompare(b.venue);
    });
  }, [data, filter, query]);

  function openVenue(venue: (typeof venues)[number]) {
    resetFlow();
    setCurrentVenue(venue);
    navigate(`/venues/${venue.id}`);
  }

  return (
    <div className="relative min-h-[calc(100vh-100px)] w-full overflow-visible pt-1 pb-24 md:pt-2">
      {/* Background Horse */}
      <div className="pointer-events-none absolute right-0 top-[-10px] -z-10 w-[min(40vw,500px)] min-w-[300px] opacity-75 md:right-0 md:top-[-18px] lg:right-2 lg:w-[min(36vw,520px)]">
        <img src={horseBg} alt="" className="h-auto w-full object-contain" />
      </div>

      <div className="relative z-10 mb-10 text-center">
        <img src={wfLogo} alt="Winning Form" className="mx-auto -mt-2 mb-4 h-24 w-auto object-contain md:-mt-4 md:mb-3 md:h-28" />
        <h1 className="mb-4 text-[2.55rem] font-extrabold leading-tight tracking-tight text-gray-900 sm:text-[2.95rem] md:text-[3.3rem]">
          Select Your <span className="text-purple-600">Location</span>
        </h1>
        <p className="text-lg font-medium text-gray-500 md:text-[1.35rem]">
          Pick a race track to see what's racing today
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12 relative z-10">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location..."
            className="w-full rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-md py-4 pl-14 pr-4 text-base font-medium outline-none transition-shadow focus:border-purple-300 focus:ring-4 focus:ring-purple-100 shadow-sm"
          />
        </div>
        <FilterPills value={filter} onChange={setFilter} />
      </div>

      <AsyncBoundary
        isLoading={isLoading}
        isError={isError}
        isEmpty={venues.length === 0}
        emptyMessage="No live races are available right now."
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {venues.map((venue) => {
            const isHovered = hoveredVenueId === venue.id;
            const isLive = venue.races.some(r => r.is_live);
            
            return (
              <div
                key={venue.id}
                onMouseEnter={() => setHoveredVenueId(venue.id)}
                onMouseLeave={() => setHoveredVenueId(null)}
                onClick={() => openVenue(venue)}
                role="button"
                tabIndex={0}
                className={`group relative flex flex-col overflow-hidden rounded-[1.2rem] transition-all duration-300 cursor-pointer 
                  ${isHovered ? 'ring-[3px] ring-purple-600 shadow-[0_12px_40px_rgb(0,0,0,0.15)] -translate-y-1' : 'border border-gray-100 bg-white shadow-sm hover:shadow-md'}`}
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img 
                    src={getVenueImage(venue.venue)} 
                    alt={venue.venue}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute right-4 top-4">
                    {isLive ? (
                      <div className="flex items-center gap-2 rounded-xl bg-[#0F0A1A] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        LIVE
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 shadow-lg">
                        <Clock className="h-3.5 w-3.5 text-purple-600" />
                        UPCOMING
                      </div>
                    )}
                  </div>
                </div>

                <div className={`flex flex-1 flex-col justify-between p-5 transition-colors duration-300 ${isHovered ? 'bg-[#0A0413]' : 'bg-white'}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <MapPin className={`h-6 w-6 shrink-0 ${isHovered ? 'text-purple-500' : 'text-purple-600'}`} />
                    <h3 className={`text-[1.3rem] font-bold leading-tight ${isHovered ? 'text-white' : 'text-gray-900'}`}>
                      {venue.venue}
                    </h3>
                  </div>

                  <div className={`mb-6 flex flex-col space-y-3 rounded-xl p-4 transition-colors duration-300 ${isHovered ? 'bg-white/5 border border-white/10' : 'bg-gray-50/80 border border-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[15px] font-semibold ${isHovered ? 'text-gray-300' : 'text-gray-700'}`}>Meeting Date</span>
                      <span className={`text-[15px] font-extrabold ${isHovered ? 'text-white' : 'text-gray-900'}`}>{formatVenueDate(venue.meeting_date)}</span>
                    </div>
                    <div className={`h-px w-full ${isHovered ? 'bg-white/10' : 'bg-gray-200/70'}`} />
                    <div className="flex items-center justify-between">
                      <span className={`text-[15px] font-semibold ${isHovered ? 'text-gray-300' : 'text-gray-700'}`}>Number of Races</span>
                      <span className={`text-[16px] font-extrabold ${isHovered ? 'text-purple-400' : 'text-purple-600'}`}>{venue.races.length}</span>
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <button className={`px-12 py-2 rounded-full font-bold text-sm transition-all duration-300 ${isHovered ? 'bg-purple-600 text-white shadow-[0_4px_14px_0_rgba(147,51,234,0.39)]' : 'bg-purple-50 text-purple-700 group-hover:bg-purple-100'}`}>
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AsyncBoundary>
      
      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="flex items-center gap-3 rounded-full border border-purple-200 bg-white/95 backdrop-blur-lg px-7 py-3.5 shadow-[0_8px_30px_rgb(139,92,246,0.12)]">
          <div className="flex h-10 w-12 shrink-0 items-center justify-center">
            <img src={horseIcon} alt="" className="h-9 w-12 object-contain" />
          </div>
          <p className="text-[15px] text-gray-800">
            <span className="font-bold text-purple-800">Next:</span> Choose a race and get smart predictions.
          </p>
        </div>
      </div>
    </div>
  );
}
