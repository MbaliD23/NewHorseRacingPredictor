import { useMemo, useState, useEffect } from "react";
import { Search, MapPin, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilterPills } from "@/components/common/FilterPills";
import { AsyncBoundary } from "@/components/status/AsyncBoundary";
import { useRaces } from "@/hooks/useRaces";
import { usePredictionStore } from "@/store/predictionStore";
import { formatDate, formatTime } from "@/lib/utils";

import horseBg from "@/assets/whitecornerhorse.png";
import wfLogo from "@/assets/winning_form+_new_logo.png";
import wfLogoDark from "@/assets/winning_form+_new_logo.png";
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

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function parseVenueMeetingDate(dateStr: string | null) {
  if (!dateStr) {
    return null;
  }

  const isoMatch = dateStr.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

type FilterValue = "all" | "today" | "upcoming";

export function LocationsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useRaces();
  const { setCurrentVenue, resetFlow, isSidebarOpen } = usePredictionStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [hoveredVenueId, setHoveredVenueId] = useState<number | null>(null);
  const [liveClock, setLiveClock] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setLiveClock(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const venues = useMemo(() => {
    const filtered = (data ?? []).filter((venue) => {
      const matchesQuery = venue.venue.toLowerCase().includes(query.toLowerCase());
      const meetingDate = parseVenueMeetingDate(venue.meeting_date);
      const isToday =
        Boolean(meetingDate && meetingDate.getTime() === TODAY.getTime()) ||
        venue.races.some((race) => race.is_live);
      const isUpcoming =
        Boolean(meetingDate && meetingDate.getTime() > TODAY.getTime()) ||
        (!isToday && venue.races.some((race) => race.is_upcoming));

      const matchesFilter =
        filter === "all" ||
        (filter === "today" && isToday) ||
        (filter === "upcoming" && isUpcoming);

      return matchesQuery && matchesFilter;
    });

    return filtered.sort((a, b) => {
      const dateA = parseVenueMeetingDate(a.meeting_date);
      const dateB = parseVenueMeetingDate(b.meeting_date);

      const isPastA = dateA ? dateA.getTime() < TODAY.getTime() : true;
      const isPastB = dateB ? dateB.getTime() < TODAY.getTime() : true;

      if (isPastA !== isPastB) {
        return isPastA ? 1 : -1;
      }

      const timeA = dateA?.getTime() ?? Number.POSITIVE_INFINITY;
      const timeB = dateB?.getTime() ?? Number.POSITIVE_INFINITY;

      if (timeA !== timeB) {
        return timeA - timeB;
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
    <div className="relative min-h-[calc(100vh-80px)] w-full flex-1 min-w-0 overflow-visible transition-all duration-300 ease-in-out pt-1 pb-10 px-[clamp(1rem,2vw,2.5rem)]">
      {/* Top Right Live Clock & Date Badge */}
      <div className="absolute right-4 sm:right-6 lg:right-8 top-3 sm:top-4 z-20 flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-purple-900/40 bg-white/80 dark:bg-slate-900/80 px-3.5 py-1.5 shadow-sm backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-200">
        <Clock className="h-3.5 w-3.5 text-[#6A2DF1] dark:text-purple-400 shrink-0" />
        <span>{formatDate(liveClock)}</span>
        <span className="text-slate-300 dark:text-slate-700 font-normal">|</span>
        <span className="tabular-nums font-bold text-[#6A2DF1] dark:text-purple-300">{formatTime(liveClock)}</span>
      </div>

      {/* Background Horse */}
      <div className="pointer-events-none absolute right-0 top-[-10px] -z-10 w-[min(40vw,500px)] min-w-[300px] opacity-100 md:right-0 md:top-[-18px] lg:right-2 lg:w-[min(36vw,520px)] transition-all duration-300">
        <img src={horseBg} alt="" className="h-auto w-full object-contain opacity-40" />
      </div>

      <div
        className={`relative z-10 mb-6 sm:mb-8 text-center max-w-4xl mx-auto flex flex-col items-center transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "-translate-x-2 sm:-translate-x-6 md:-translate-x-10 lg:-translate-x-12" : "translate-x-0"
        }`}
      >
        <img
          src={wfLogo}
          alt="Winning Form"
          className="mx-auto -mt-2 mb-3 h-20 sm:h-24 md:h-28 w-auto object-contain select-none dark:hidden transition-all duration-300"
        />
        <img
          src={wfLogoDark}
          alt="Winning Form"
          className="mx-auto -mt-2 mb-3 h-20 sm:h-24 md:h-28 w-auto object-contain select-none hidden dark:block transition-all duration-300 drop-shadow-[0_0_12px_rgba(139,92,246,0.25)]"
        />
        <h1 className="mb-2.5 text-[clamp(1.85rem,3.2vw,3.3rem)] font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
          Select Your <span className="text-purple-600">Location</span>
        </h1>
        <p className="text-[clamp(0.95rem,1.4vw,1.35rem)] font-medium text-gray-500 dark:text-slate-400 max-w-2xl">
          Pick a location to see what's racing today
        </p>
      </div>

      {/* Controls Row: Left Search Bar, Right Filter Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 sm:mb-8 mt-2 sm:mt-4 relative z-10 max-w-7xl mx-auto w-full">
        {/* Left Side: Search Bar Input */}
        <div className="relative w-full sm:w-[576px] md:w-[640px] max-w-2xl shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search locations..."
            className="w-full h-10 sm:h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-500 shadow-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Right Side: Filter Buttons Group */}
        <div className="flex items-center justify-start sm:justify-end shrink-0">
          <FilterPills value={filter} onChange={setFilter} />
        </div>
      </div>

      <AsyncBoundary
        isLoading={isLoading}
        isError={isError}
        isEmpty={venues.length === 0}
        emptyMessage="No locations are available right now."
      >
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[clamp(1rem,1.5vw,1.75rem)] relative z-10">
          {venues.map((venue) => {
            const isHovered = hoveredVenueId === venue.id;
            const isLive = venue.races.some((r) => r.is_live);
            const meetingDate = parseVenueMeetingDate(venue.meeting_date);
            const isToday = Boolean(meetingDate && meetingDate.getTime() === TODAY.getTime()) || isLive;

            return (
              <div
                key={venue.id}
                onMouseEnter={() => setHoveredVenueId(venue.id)}
                onMouseLeave={() => setHoveredVenueId(null)}
                onClick={() => openVenue(venue)}
                role="button"
                tabIndex={0}
                className={`group relative flex flex-col overflow-hidden rounded-[1.2rem] transition-all duration-300 cursor-pointer 
                  ${
                    isHovered
                      ? "ring-[3px] ring-purple-600 shadow-[0_12px_40px_rgb(0,0,0,0.25)] -translate-y-1"
                      : "border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-xs hover:shadow-md"
                  }`}
              >
                <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-slate-800">
                  <img
                    src={getVenueImage(venue.venue)}
                    alt={venue.venue}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute right-3.5 top-3.5">
                    {isToday || isLive ? (
                      <div className="flex items-center gap-1.5 rounded-xl bg-[#0F0A1A]/95 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md border border-emerald-500/30">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        <span className="tracking-wide">Today's Races</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-xl bg-[#0F0A1A]/85 px-3 py-1.5 text-xs font-bold text-slate-200 shadow-lg backdrop-blur-md border border-purple-500/30">
                        <Clock className="h-3.5 w-3.5 text-purple-400" />
                        <span className="tracking-wide">Upcoming Races</span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`flex flex-1 flex-col justify-between p-5 transition-colors duration-300 ${
                    isHovered ? "bg-slate-900/90 backdrop-blur-md" : "bg-white dark:bg-[#131424]/90"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className={`h-5 w-5 shrink-0 ${isHovered ? "text-purple-400" : "text-purple-600"}`} />
                    <h3 className={`text-lg font-bold leading-tight ${isHovered ? "text-white" : "text-gray-900 dark:text-white"}`}>
                      {venue.venue}
                    </h3>
                  </div>

                  <div
                    className={`mb-5 flex flex-col space-y-2.5 rounded-xl p-3.5 transition-colors duration-300 ${
                      isHovered ? "bg-white/5 border border-white/10" : "bg-gray-50/80 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={isHovered ? "text-gray-300" : "text-gray-600 dark:text-slate-400 font-semibold"}>Meeting Date</span>
                      <span className={`font-extrabold ${isHovered ? "text-white" : "text-gray-900 dark:text-slate-100"}`}>
                        {formatVenueDate(venue.meeting_date)}
                      </span>
                    </div>
                    <div className={`h-px w-full ${isHovered ? "bg-white/10" : "bg-gray-200/70 dark:bg-slate-800/80"}`} />
                    <div className="flex items-center justify-between text-xs">
                      <span className={isHovered ? "text-gray-300" : "text-gray-600 dark:text-slate-400 font-semibold"}>Number of Races</span>
                      <span className={`font-extrabold ${isHovered ? "text-purple-400" : "text-purple-600"}`}>
                        {venue.races.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      className={`w-full py-2 rounded-full font-bold text-xs transition-all duration-300 cursor-pointer ${
                        isHovered
                          ? "bg-purple-600 text-white shadow-[0_4px_14px_0_rgba(147,51,234,0.39)]"
                          : "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50"
                      }`}
                    >
                      View Races
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AsyncBoundary>
    </div>
  );
}
