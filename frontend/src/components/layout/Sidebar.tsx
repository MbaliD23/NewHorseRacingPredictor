import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  MapPin,
  Flag,
  ChevronDown,
  BarChart2,
  Activity,
  Clock,
  Sparkles,
  Trophy,
  Sliders,
  Home,
  Lock,
} from "lucide-react";
import { usePredictionStore } from "@/store/predictionStore";
import { useRaces } from "@/hooks/useRaces";
import { useRace } from "@/hooks/useRace";
import { formatDate, formatTime, valueOrUnavailable } from "@/lib/utils";
import type { Venue, RaceCard, Horse } from "@/types/race";

/* ─── Rail Tooltip (collapsed mode) ─────────────────────────────── */
function RailTooltip({ text, children }: { text: string; children: React.ReactElement }) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className="relative flex items-center w-full justify-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="pointer-events-none absolute left-full ml-3 z-[200] whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
}

/* ─── Draw-number color helper ──────────────────────────────────── */
function getDrawBadge(draw: number | null, isSelected: boolean) {
  const num = draw ?? 1;
  switch (num) {
    case 1:
      return { bg: "#6A2DF1", text: "#ffffff", border: "transparent" };
    case 2:
      return { bg: isSelected ? "#ffffff" : "#f1f5f9", text: "#0f172a", border: "#cbd5e1" };
    case 3:
      return { bg: "#1A56DB", text: "#ffffff", border: "transparent" };
    case 4:
      return { bg: "#e2e8f0", text: "#0f172a", border: "transparent" };
    case 5:
      return { bg: "#DC2626", text: "#ffffff", border: "transparent" };
    default:
      return { bg: "#334155", text: "#ffffff", border: "transparent" };
  }
}

type SectionKey = "events" | "races" | "horses" | "predictor" | null;

const accordionAnimation = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
};

/* ─── Main Sidebar Component ─────────────────────────────────────── */
export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [liveClock, setLiveClock] = useState(() => new Date());
  const [lockedAlertMessage, setLockedAlertMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Accordion section refs for auto-scrolling
  const eventsRef = useRef<HTMLDivElement>(null);
  const racesRef = useRef<HTMLDivElement>(null);
  const horsesRef = useRef<HTMLDivElement>(null);
  const predictorRef = useRef<HTMLDivElement>(null);

  // Single active expanded section (mutual exclusion)
  const [expandedSection, setExpandedSection] = useState<SectionKey>("events");

  // Global store
  const {
    currentVenue,
    currentRace,
    currentHorse,
    predictionResult,
    setCurrentVenue,
    setCurrentRace,
    setCurrentHorse,
    resetFlow,
  } = usePredictionStore();

  // Backend queries
  const { data: allVenues = [] } = useRaces();

  // Live clock ticker
  useEffect(() => {
    const id = window.setInterval(() => setLiveClock(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  /* ─── URL Matchers for Bidirectional Synchronization ───────────── */
  const urlVenueId = useMemo(() => {
    const match = location.pathname.match(/\/venues\/(\d+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const urlRaceId = useMemo(() => {
    const match = location.pathname.match(/\/(?:races|analysis)\/(\d+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const urlHorseId = useMemo(() => {
    const match = location.pathname.match(/\/horses\/(\d+)/) || location.pathname.match(/\/predictions\/horses\/(\d+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const isPredictorActive = useMemo(() => {
    return location.pathname.startsWith("/analysis") || location.pathname.startsWith("/predictions");
  }, [location.pathname]);

  // Resolve Active Venue
  const activeVenue: Venue | null = useMemo(() => {
    if (urlVenueId) {
      return allVenues.find((v) => String(v.id) === urlVenueId) ?? currentVenue;
    }
    if (currentVenue) return currentVenue;
    if (currentRace) {
      return allVenues.find((v) => v.races.some((r) => r.id === currentRace.id)) ?? null;
    }
    return null;
  }, [urlVenueId, allVenues, currentVenue, currentRace]);

  // Resolve Active Race ID for queries
  const activeRaceId = useMemo(() => {
    if (urlRaceId) return urlRaceId;
    if (currentRace?.id) return String(currentRace.id);
    if (currentHorse?.race_id) return String(currentHorse.race_id);
    return null;
  }, [urlRaceId, currentRace, currentHorse]);

  // Query Race Details to get full horses list
  const { data: raceDetails } = useRace(activeRaceId ?? undefined);

  // Predictor locked / unlocked enforcement: requires an active venue/event AND an active race
  const isPredictorUnlocked = Boolean(activeVenue && (currentRace || activeRaceId));

  const triggerLockedAlert = () => {
    setLockedAlertMessage("Please select an event and race first.");
    window.setTimeout(() => setLockedAlertMessage(null), 3000);
  };

  const toggleSection = (section: SectionKey) => {
    if (section === "predictor" && !isPredictorUnlocked) {
      triggerLockedAlert();
      return;
    }
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  // Synchronize store when navigating via URL
  useEffect(() => {
    if (urlVenueId && allVenues.length > 0) {
      const v = allVenues.find((item) => String(item.id) === urlVenueId);
      if (v && currentVenue?.id !== v.id) {
        setCurrentVenue(v);
      }
    }
  }, [urlVenueId, allVenues, currentVenue, setCurrentVenue]);

  useEffect(() => {
    if (raceDetails && currentRace?.id !== raceDetails.id) {
      setCurrentRace(raceDetails);
      if (!currentVenue && allVenues.length > 0) {
        const v = allVenues.find((item) => item.races.some((r) => r.id === raceDetails.id));
        if (v) setCurrentVenue(v);
      }
    }
  }, [raceDetails, currentRace, currentVenue, allVenues, setCurrentRace, setCurrentVenue]);

  useEffect(() => {
    if (urlHorseId && raceDetails?.horses) {
      const h = raceDetails.horses.find((item) => String(item.id) === urlHorseId);
      if (h && currentHorse?.id !== h.id) {
        setCurrentHorse(h);
      }
    }
  }, [urlHorseId, raceDetails, currentHorse, setCurrentHorse]);

  // Resolved list of races for active venue
  const activeVenueRaces: RaceCard[] = useMemo(() => {
    return activeVenue?.races ?? [];
  }, [activeVenue]);

  // Resolved list of horses for active race
  const activeHorses: Horse[] = useMemo(() => {
    if (raceDetails?.horses && raceDetails.horses.length > 0) {
      return raceDetails.horses;
    }
    if (currentRace?.horses && currentRace.horses.length > 0) {
      return currentRace.horses;
    }
    return [];
  }, [raceDetails, currentRace]);

  /* ─── Context-Aware Auto-Open (Single Expanded Section) ─────────── */
  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "") {
      setExpandedSection("events");
    } else if (location.pathname.startsWith("/venues")) {
      setExpandedSection("races");
    } else if (location.pathname.startsWith("/races") || location.pathname.startsWith("/horses")) {
      setExpandedSection("horses");
    } else if (isPredictorActive && isPredictorUnlocked) {
      setExpandedSection("predictor");
    } else if (location.pathname === "/radar-analytics" || location.pathname === "/bar-analytics") {
      setExpandedSection(null);
    }
  }, [location.pathname, isPredictorActive, isPredictorUnlocked]);

  /* ─── Smooth Auto-Scroll on Accordion Transition ────────────────── */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (expandedSection === "events") {
        eventsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else if (expandedSection === "races") {
        racesRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else if (expandedSection === "horses") {
        horsesRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else if (expandedSection === "predictor") {
        predictorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [expandedSection]);

  /* ─── Selection Handlers ────────────────────────────────────────── */
  const handleSelectVenue = (venue: Venue) => {
    setCurrentVenue(venue);
    setExpandedSection("races");
    navigate(`/venues/${venue.id}`);
  };

  const handleSelectRace = (race: RaceCard | { id: number; race_number: number; title?: string | null }) => {
    if (raceDetails && raceDetails.id === race.id) {
      setCurrentRace(raceDetails);
    } else {
      const venueMatchingRace = allVenues.find((v) => v.races.some((r) => r.id === race.id));
      if (venueMatchingRace) setCurrentVenue(venueMatchingRace);
    }
    setExpandedSection("horses");
    navigate(`/races/${race.id}`);
  };

  const handleSelectHorse = (horse: Horse) => {
    setCurrentHorse(horse);
    navigate(`/horses/${horse.id}`);
  };

  const handleHomeClick = () => {
    resetFlow();
    setCurrentVenue(null);
    setCurrentRace(null);
    setCurrentHorse(null);
    setExpandedSection("events");
    navigate("/");
  };

  const handleGoToPredictor = () => {
    if (!isPredictorUnlocked) {
      triggerLockedAlert();
      return;
    }
    setExpandedSection("predictor");
    if (activeRaceId) {
      navigate(`/analysis/${activeRaceId}`);
    } else if (activeVenue?.races?.[0]) {
      navigate(`/analysis/${activeVenue.races[0].id}`);
    }
  };

  const railBtn = (active: boolean) =>
    [
      "flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-xl transition-all duration-200 mx-auto",
      active ? "bg-slate-100 text-slate-950 font-bold" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    ].join(" ");

  return (
    <aside
      className={[
        "flex h-full flex-col bg-white border-r border-slate-200",
        "transition-all duration-300 ease-in-out shrink-0 overflow-hidden z-50 select-none shadow-sm",
        expanded ? "w-72" : "w-16",
      ].join(" ")}
    >
      {/* ── Top Header: Brand + Collapse/Expand Toggle ─────────── */}
      <div
        className={[
          "flex items-center border-b border-slate-100 px-3.5 py-4 shrink-0",
          expanded ? "justify-between" : "justify-center",
        ].join(" ")}
      >
        {expanded ? (
          <div
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
            onClick={handleHomeClick}
            role="button"
            tabIndex={0}
            title="Reset and go to Home"
          >
            <div className="flex h-8 w-8 shrink-0 aspect-square items-center justify-center rounded-xl bg-[#6A2DF1] shadow-sm shadow-purple-600/20 group-hover:bg-[#5822d8] transition-colors">
              <Home className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-sm font-black text-slate-900 tracking-tight leading-none group-hover:text-purple-700 transition-colors">
                winning form +
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleHomeClick}
            className="flex h-8 w-8 shrink-0 aspect-square items-center justify-center rounded-xl bg-[#6A2DF1] shadow-sm shadow-purple-600/20 hover:bg-[#5822d8] transition-colors"
            title="Reset and go to Home"
            aria-label="Home"
          >
            <Home className="h-4 w-4 text-white" />
          </button>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex h-8 w-8 shrink-0 aspect-square items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <X className="h-4 w-4" /> : <Menu className="h-5 w-5 text-slate-800" />}
        </button>
      </div>

      {/* ── Navigation Body ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 min-h-0 space-y-2.5 scroll-smooth">
        {expanded ? (
          /* ══════════════════════════════════════════════════════════
             EXPANDED ACCORDION VIEW (MUTUAL EXCLUSION)
             ══════════════════════════════════════════════════════════ */
          <>
            {/* ── LEVEL 1: EVENTS DROPDOWN ────────────────────────── */}
            <div ref={eventsRef} className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-1.5 transition-all duration-200">
              <button
                onClick={() => toggleSection("events")}
                className="flex w-full items-center justify-between px-2 py-1.5 text-left rounded-lg hover:bg-slate-100/70 transition-all duration-200 group"
                aria-expanded={expandedSection === "events"}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-4 w-4 text-[#6A2DF1] shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Events
                  </span>
                  <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                    {allVenues.length}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                    expandedSection === "events"
                      ? "rotate-0 text-slate-900"
                      : "-rotate-90 text-slate-400 group-hover:text-slate-700"
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {expandedSection === "events" && (
                  <motion.div
                    key="events-content"
                    initial={accordionAnimation.initial}
                    animate={accordionAnimation.animate}
                    exit={accordionAnimation.exit}
                    transition={accordionAnimation.transition}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 space-y-0.5 pt-1 border-t border-slate-100 max-h-60 overflow-y-auto">
                      {allVenues.map((venue) => {
                        const isSelected = activeVenue?.id === venue.id && (location.pathname.startsWith("/venues") || location.pathname === "/");
                        return (
                          <button
                            key={venue.id}
                            onClick={() => handleSelectVenue(venue)}
                            className={[
                              "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all duration-200 ease-in-out",
                              isSelected
                                ? "bg-white text-slate-950 font-bold shadow-xs border-l-4 border-slate-900"
                                : "text-slate-600 hover:bg-white/80 hover:text-slate-900 font-medium",
                            ].join(" ")}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="truncate text-xs font-bold leading-tight">
                                {venue.venue}
                              </div>
                              <div className="truncate text-[10px] text-slate-500 mt-0.5">
                                {formatDate(venue.meeting_date)}
                              </div>
                            </div>
                            <span
                              className={[
                                "rounded-md px-1.5 py-0.5 text-[10px] font-bold shrink-0 transition-all duration-200",
                                isSelected
                                  ? "bg-[#6A2DF1] text-white"
                                  : "bg-slate-200/70 text-slate-600",
                              ].join(" ")}
                            >
                              {venue.races?.length ?? 0} R
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── LEVEL 2: RACES DROPDOWN ─────────────────────────── */}
            <div ref={racesRef} className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-1.5 transition-all duration-200">
              <button
                onClick={() => toggleSection("races")}
                className="flex w-full items-center justify-between px-2 py-1.5 text-left rounded-lg hover:bg-slate-100/70 transition-all duration-200 group"
                aria-expanded={expandedSection === "races"}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Flag className="h-4 w-4 text-[#1A56DB] shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 truncate">
                    {activeVenue ? `${activeVenue.venue} Races` : "Races"}
                  </span>
                  {activeVenueRaces.length > 0 && (
                    <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 shrink-0">
                      {activeVenueRaces.length}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                    expandedSection === "races"
                      ? "rotate-0 text-slate-900"
                      : "-rotate-90 text-slate-400 group-hover:text-slate-700"
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {expandedSection === "races" && (
                  <motion.div
                    key="races-content"
                    initial={accordionAnimation.initial}
                    animate={accordionAnimation.animate}
                    exit={accordionAnimation.exit}
                    transition={accordionAnimation.transition}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 space-y-0.5 pt-1 border-t border-slate-100 max-h-60 overflow-y-auto">
                      {activeVenueRaces.length > 0 ? (
                        activeVenueRaces.map((race) => {
                          const isSelected = (String(currentRace?.id) === String(race.id) || String(urlRaceId) === String(race.id)) && location.pathname.startsWith("/races");
                          return (
                            <button
                              key={race.id}
                              onClick={() => handleSelectRace(race)}
                              className={[
                                "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200 ease-in-out",
                                isSelected
                                  ? "bg-white text-slate-950 font-bold shadow-xs border-l-4 border-slate-900"
                                  : "text-slate-600 hover:bg-white/80 hover:text-slate-900 font-medium",
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-black transition-all duration-200",
                                  isSelected ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700",
                                ].join(" ")}
                              >
                                {race.race_number}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-bold leading-tight">
                                  {valueOrUnavailable(race.title)}
                                </div>
                                <div className="truncate text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                                  <span>{formatTime(race.race_time)}</span>
                                  {race.distance && (
                                    <>
                                      <span>•</span>
                                      <span>{race.distance}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {race.is_live && (
                                <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse shrink-0 aspect-square" />
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 text-xs text-slate-500 italic">
                          {activeVenue ? "No races found for this event." : "Select an event above to view races."}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── LEVEL 3: HORSES DROPDOWN / QUICK-SELECT ─────────── */}
            <div ref={horsesRef} className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-1.5 transition-all duration-200">
              <button
                onClick={() => toggleSection("horses")}
                className="flex w-full items-center justify-between px-2 py-1.5 text-left rounded-lg hover:bg-slate-100/70 transition-all duration-200 group"
                aria-expanded={expandedSection === "horses"}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Activity className="h-4 w-4 text-[#DC2626] shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 truncate">
                    {currentRace ? `Race ${currentRace.race_number} Horses` : "Horses"}
                  </span>
                  {activeHorses.length > 0 && (
                    <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 shrink-0">
                      {activeHorses.length}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                    expandedSection === "horses"
                      ? "rotate-0 text-slate-900"
                      : "-rotate-90 text-slate-400 group-hover:text-slate-700"
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {expandedSection === "horses" && (
                  <motion.div
                    key="horses-content"
                    initial={accordionAnimation.initial}
                    animate={accordionAnimation.animate}
                    exit={accordionAnimation.exit}
                    transition={accordionAnimation.transition}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 space-y-0.5 pt-1 border-t border-slate-100 max-h-60 overflow-y-auto">
                      {activeHorses.length > 0 ? (
                        activeHorses.map((horse) => {
                          const isSelected = (String(currentHorse?.id) === String(horse.id) || String(urlHorseId) === String(horse.id)) && location.pathname.startsWith("/horses");
                          const badge = getDrawBadge(horse.draw_number, isSelected);
                          return (
                            <button
                              key={horse.id}
                              onClick={() => handleSelectHorse(horse)}
                              className={[
                                "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200 ease-in-out",
                                isSelected
                                  ? "bg-white text-slate-950 font-bold shadow-xs border-l-4 border-slate-900"
                                  : "text-slate-600 hover:bg-white/80 hover:text-slate-900 font-medium",
                              ].join(" ")}
                            >
                              <span
                                className="flex h-6 w-6 shrink-0 aspect-square items-center justify-center rounded-[4px] text-xs font-black transition-all duration-200"
                                style={{
                                  backgroundColor: badge.bg,
                                  color: badge.text,
                                  border: badge.border !== "transparent" ? `1px solid ${badge.border}` : undefined,
                                }}
                              >
                                {horse.draw_number ?? "—"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-bold leading-tight">
                                  {horse.name}
                                </div>
                                <div className="truncate text-[10px] text-slate-500 mt-0.5">
                                  J: {valueOrUnavailable(horse.jockey_name)}
                                </div>
                              </div>
                              {isSelected && (
                                <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider transition-all duration-200">
                                  Active
                                </span>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 text-xs text-slate-500 italic">
                          {currentRace ? "Loading horse list..." : "Select a race above to view horses."}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── LEVEL 4: PREDICTOR SECTION ──────────────────────── */}
            <div
              ref={predictorRef}
              className={[
                "rounded-2xl border bg-slate-50/40 p-1.5 transition-all duration-200 relative",
                !isPredictorUnlocked
                  ? "border-slate-200/60 opacity-60"
                  : "border-slate-200/80",
              ].join(" ")}
              title={!isPredictorUnlocked ? "Please select an event and race first." : undefined}
            >
              <button
                onClick={() => toggleSection("predictor")}
                className={[
                  "flex w-full items-center justify-between px-2 py-1.5 text-left rounded-lg transition-all duration-200 group",
                  !isPredictorUnlocked
                    ? "cursor-not-allowed hover:bg-slate-100/40"
                    : "hover:bg-slate-100/70",
                ].join(" ")}
                aria-expanded={expandedSection === "predictor"}
                title={!isPredictorUnlocked ? "Please select an event and race first." : undefined}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className={`h-4 w-4 shrink-0 ${isPredictorUnlocked ? "text-[#8B5CF6]" : "text-slate-400"}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Predictor
                  </span>
                  {!isPredictorUnlocked ? (
                    <span className="flex items-center gap-1 rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[9px] font-bold text-slate-500">
                      <Lock className="h-2.5 w-2.5" /> Locked
                    </span>
                  ) : isPredictorActive ? (
                    <span className="rounded-full bg-purple-100 px-1.5 py-0.2 text-[9px] font-bold text-purple-700">
                      Active
                    </span>
                  ) : null}
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                    expandedSection === "predictor"
                      ? "rotate-0 text-slate-900"
                      : "-rotate-90 text-slate-400 group-hover:text-slate-700"
                  }`}
                />
              </button>

              {/* Subtle alert message when clicked while locked */}
              {lockedAlertMessage && expanded && (
                <div className="mx-1 mt-1.5 rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1.5 text-[11px] font-semibold text-purple-800 shadow-xs">
                  {lockedAlertMessage}
                </div>
              )}

              <AnimatePresence initial={false}>
                {expandedSection === "predictor" && isPredictorUnlocked && (
                  <motion.div
                    key="predictor-content"
                    initial={accordionAnimation.initial}
                    animate={accordionAnimation.animate}
                    exit={accordionAnimation.exit}
                    transition={accordionAnimation.transition}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 space-y-0.5 pt-1 border-t border-slate-100">
                      {/* Factor Analysis / Tuning */}
                      <button
                        onClick={handleGoToPredictor}
                        className={[
                          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200 ease-in-out",
                          location.pathname.startsWith("/analysis")
                            ? "bg-white text-slate-950 font-bold shadow-xs border-l-4 border-slate-900"
                            : "text-slate-600 hover:bg-white/80 hover:text-slate-900 font-medium",
                        ].join(" ")}
                      >
                        <Sliders className="h-4 w-4 text-[#8B5CF6] shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-bold leading-tight">
                            Factor Tuning
                          </div>
                          <div className="truncate text-[10px] text-slate-500 mt-0.5">
                            {currentRace ? `Race ${currentRace.race_number} Model` : "Select race factors"}
                          </div>
                        </div>
                      </button>

                      {/* Prediction Results */}
                      <button
                        onClick={() => {
                          if (predictionResult) {
                            navigate("/predictions/results");
                          } else if (activeRaceId) {
                            navigate(`/analysis/${activeRaceId}`);
                          } else {
                            handleGoToPredictor();
                          }
                        }}
                        className={[
                          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200 ease-in-out",
                          location.pathname.startsWith("/predictions")
                            ? "bg-white text-slate-950 font-bold shadow-xs border-l-4 border-slate-900"
                            : "text-slate-600 hover:bg-white/80 hover:text-slate-900 font-medium",
                        ].join(" ")}
                      >
                        <Trophy className="h-4 w-4 text-[#EAB308] shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-bold leading-tight">
                            Results & Rankings
                          </div>
                          <div className="truncate text-[10px] text-slate-500 mt-0.5">
                            {predictionResult ? "View top predictions" : "Run model first"}
                          </div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Separator */}
            <div className="my-1.5 h-px bg-slate-200/80 mx-1" />

            {/* Analytics Navigation Links */}
            <div className="space-y-0.5">
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Analytics Views
              </div>
              <button
                onClick={() => navigate("/radar-analytics")}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-200 ease-in-out",
                  location.pathname === "/radar-analytics"
                    ? "bg-slate-100 text-slate-950 font-bold border-l-4 border-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium",
                ].join(" ")}
              >
                <Activity className="h-4 w-4 text-[#6A2DF1] shrink-0" />
                <span className="text-sm">Radar Analytics</span>
              </button>

              <button
                onClick={() => navigate("/bar-analytics")}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-200 ease-in-out",
                  location.pathname === "/bar-analytics"
                    ? "bg-slate-100 text-slate-950 font-bold border-l-4 border-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium",
                ].join(" ")}
              >
                <BarChart2 className="h-4 w-4 text-[#10B981] shrink-0" />
                <span className="text-sm">Bar Analytics (5 Horses)</span>
              </button>
            </div>
          </>
        ) : (
          /* ══════════════════════════════════════════════════════════
             COLLAPSED RAIL VIEW (64px)
             ══════════════════════════════════════════════════════════ */
          <div className="flex flex-col items-center gap-1.5 w-full">
            <RailTooltip text="Home (Reset All)">
              <button
                onClick={handleHomeClick}
                className={railBtn(location.pathname === "/")}
                title="Reset and go to Home"
                aria-label="Home"
              >
                <Home className="h-5 w-5 text-[#6A2DF1]" />
              </button>
            </RailTooltip>

            <div className="my-1 w-8 h-px bg-slate-200" />

            <RailTooltip text={activeVenue ? `Events: ${activeVenue.venue}` : "Events"}>
              <button
                onClick={() => {
                  if (activeVenue) navigate(`/venues/${activeVenue.id}`);
                  else navigate("/");
                }}
                className={railBtn(location.pathname.startsWith("/venues"))}
              >
                <MapPin className="h-5 w-5 text-[#6A2DF1]" />
              </button>
            </RailTooltip>

            <RailTooltip text={currentRace ? `Race ${currentRace.race_number}: ${valueOrUnavailable(currentRace.title)}` : "Races"}>
              <button
                onClick={() => {
                  if (currentRace) navigate(`/races/${currentRace.id}`);
                  else if (activeVenue) navigate(`/venues/${activeVenue.id}`);
                }}
                className={railBtn(Boolean(location.pathname.startsWith("/races")))}
              >
                <Flag className="h-5 w-5 text-[#1A56DB]" />
              </button>
            </RailTooltip>

            {/* Compact Horse Number Pills in Rail Mode */}
            {activeHorses.length > 0 && (
              <>
                <div className="my-1 w-8 h-px bg-slate-200" />
                <div className="flex flex-col items-center gap-1.5 w-full max-h-48 overflow-y-auto">
                  {activeHorses.map((horse) => {
                    const isSelected = (String(currentHorse?.id) === String(horse.id) || String(urlHorseId) === String(horse.id)) && location.pathname.startsWith("/horses");
                    const badge = getDrawBadge(horse.draw_number, isSelected);
                    return (
                      <RailTooltip key={horse.id} text={`[${horse.draw_number ?? "?"}] ${horse.name}`}>
                        <button
                          onClick={() => handleSelectHorse(horse)}
                          className={[
                            "flex h-8 w-8 shrink-0 aspect-square items-center justify-center rounded-lg text-xs font-black transition-all duration-200",
                            isSelected ? "ring-2 ring-slate-900 ring-offset-1 scale-110 shadow-sm" : "hover:opacity-80",
                          ].join(" ")}
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: badge.border !== "transparent" ? `1px solid ${badge.border}` : undefined,
                          }}
                        >
                          {horse.draw_number ?? "?"}
                        </button>
                      </RailTooltip>
                    );
                  })}
                </div>
              </>
            )}

            <div className="my-1 w-8 h-px bg-slate-200" />

            <RailTooltip text={isPredictorUnlocked ? "Predictor" : "Please select an event and race first."}>
              <button
                onClick={handleGoToPredictor}
                className={[
                  railBtn(isPredictorActive),
                  !isPredictorUnlocked ? "opacity-40 cursor-not-allowed" : "",
                ].join(" ")}
                title={!isPredictorUnlocked ? "Please select an event and race first." : undefined}
                aria-disabled={!isPredictorUnlocked}
              >
                <Sparkles className="h-5 w-5 text-[#8B5CF6]" />
              </button>
            </RailTooltip>

            <div className="my-1 w-8 h-px bg-slate-200" />

            <RailTooltip text="Radar Analytics">
              <button
                onClick={() => navigate("/radar-analytics")}
                className={railBtn(location.pathname === "/radar-analytics")}
              >
                <Activity className="h-5 w-5 text-[#6A2DF1]" />
              </button>
            </RailTooltip>

            <RailTooltip text="Bar Analytics (Compare 5)">
              <button
                onClick={() => navigate("/bar-analytics")}
                className={railBtn(location.pathname === "/bar-analytics")}
              >
                <BarChart2 className="h-5 w-5 text-[#10B981]" />
              </button>
            </RailTooltip>
          </div>
        )}
      </nav>

      {/* ── Footer: Clean Clock ────────────────────────────────── */}
      <div
        className={[
          "shrink-0 border-t border-slate-100 px-3.5 py-3",
          expanded ? "flex items-center justify-between" : "flex flex-col items-center justify-center",
        ].join(" ")}
      >
        {expanded ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 w-full justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{formatDate(liveClock)}</span>
            </div>
            <span className="tabular-nums font-semibold text-slate-700">{formatTime(liveClock)}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center text-slate-400" title={`${formatDate(liveClock)} ${formatTime(liveClock)}`}>
            <Clock className="h-4 w-4" />
          </div>
        )}
      </div>
    </aside>
  );
}
