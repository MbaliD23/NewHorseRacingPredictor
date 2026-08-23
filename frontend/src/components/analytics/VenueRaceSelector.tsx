import React, { useState, useRef, useEffect } from "react";
import { MapPin, Trophy, ChevronDown } from "lucide-react";
import type { Venue, RaceCard } from "@/types/race";

export const FALLBACK_VENUES: Venue[] = [
  {
    id: 1,
    venue: "Vaal",
    meeting_date: "2026-08-18",
    races: [
      { id: 101, race_number: 1, race_time: "12:15", distance: "1200m", surface: "Turf", field_size: 5, status: "Open", title: "Racing Welcomes You MR 95 Hcp", runners: 5, is_live: true, is_upcoming: false },
      { id: 102, race_number: 2, race_time: "12:50", distance: "1400m", surface: "Turf", field_size: 5, status: "Upcoming", title: "Racing Today Maiden Plate", runners: 5, is_live: false, is_upcoming: true },
      { id: 103, race_number: 3, race_time: "13:25", distance: "1600m", surface: "Turf", field_size: 5, status: "Upcoming", title: "Tab Telebet Classified Stakes", runners: 5, is_live: false, is_upcoming: true },
    ],
  },
  {
    id: 2,
    venue: "Hollywoodbets Greyville",
    meeting_date: "2026-08-18",
    races: [
      { id: 201, race_number: 1, race_time: "12:30", distance: "1000m", surface: "Polytrack", field_size: 5, status: "Open", title: "Catch KZN Racing Maiden Juvenile Plate", runners: 5, is_live: true, is_upcoming: false },
      { id: 202, race_number: 2, race_time: "13:05", distance: "1200m", surface: "Polytrack", field_size: 5, status: "Upcoming", title: "Gallop TV MR 76 Handicap", runners: 5, is_live: false, is_upcoming: true },
    ],
  },
  {
    id: 3,
    venue: "Turffontein",
    meeting_date: "2026-08-18",
    races: [
      { id: 301, race_number: 1, race_time: "13:10", distance: "1160m", surface: "Standside", field_size: 5, status: "Upcoming", title: "4Racing Welcomes You Maiden Plate", runners: 5, is_live: false, is_upcoming: true },
      { id: 302, race_number: 2, race_time: "13:45", distance: "1400m", surface: "Standside", field_size: 5, status: "Upcoming", title: "Champions Day Pinnacle Stakes", runners: 5, is_live: false, is_upcoming: true },
    ],
  },
];

interface VenueRaceSelectorProps {
  venues: Venue[];
  selectedVenueId: number | string | null;
  selectedRaceId: number | string | null;
  onSelectVenue: (venue: Venue) => void;
  onSelectRace: (race: RaceCard) => void;
}

export function VenueRaceSelector({
  venues,
  selectedVenueId,
  selectedRaceId,
  onSelectVenue,
  onSelectRace,
}: VenueRaceSelectorProps) {
  const [venueOpen, setVenueOpen] = useState(false);
  const [raceOpen, setRaceOpen] = useState(false);

  const venueRef = useRef<HTMLDivElement>(null);
  const raceRef = useRef<HTMLDivElement>(null);

  const effectiveVenues = venues && venues.length > 0 ? venues : FALLBACK_VENUES;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (venueRef.current && !venueRef.current.contains(event.target as Node)) {
        setVenueOpen(false);
      }
      if (raceRef.current && !raceRef.current.contains(event.target as Node)) {
        setRaceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedVenue = effectiveVenues.find((v) => String(v.id) === String(selectedVenueId)) ?? null;
  const availableRaces = selectedVenue?.races ?? [];
  const selectedRace = availableRaces.find((r) => String(r.id) === String(selectedRaceId)) ?? null;

  const venueLabel = selectedVenue ? selectedVenue.venue : "Select Event / Venue";
  
  const raceLabel = selectedRace
    ? `Race ${selectedRace.race_number}${selectedRace.title ? `: ${selectedRace.title}` : ""}`
    : "Select Race";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", flexWrap: "wrap" }}>
      {/* ── STAGE 1: Venue Selector Block ── */}
      <div ref={venueRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => {
            setVenueOpen((prev) => !prev);
            setRaceOpen(false);
          }}
          aria-haspopup="listbox"
          aria-expanded={venueOpen}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "7px 13px",
            borderRadius: 10,
            background: venueOpen ? "#1e1b4b" : "#121324",
            border: `1px solid ${venueOpen ? "rgba(59, 130, 246, 0.55)" : "rgba(148, 163, 184, 0.22)"}`,
            color: selectedVenue ? "#F8FAFC" : "#94A3B8",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            boxShadow: venueOpen ? "0 0 14px rgba(59, 130, 246, 0.25)" : "0 2px 8px rgba(0, 0, 0, 0.25)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            fontFamily: "'Outfit','Inter',sans-serif",
            whiteSpace: "nowrap",
            width: "auto",
          }}
          onMouseEnter={(e) => {
            if (!venueOpen) {
              (e.currentTarget as HTMLButtonElement).style.background = "#1c1d36";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(59, 130, 246, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!venueOpen) {
              (e.currentTarget as HTMLButtonElement).style.background = "#121324";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(148, 163, 184, 0.22)";
            }
          }}
        >
          <MapPin size={13} style={{ color: selectedVenue ? "#60A5FA" : "#94A3B8", flexShrink: 0 }} />
          <span>{venueLabel}</span>
          <ChevronDown
            size={13}
            style={{
              color: "#94A3B8",
              transform: venueOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
          />
        </button>

        {venueOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              minWidth: 210,
              maxWidth: 320,
              background: "#121324",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: 12,
              padding: "6px",
              boxShadow: "0 16px 45px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              zIndex: 600,
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            <div style={{ padding: "4px 8px 6px", fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Event Venues
            </div>
            {effectiveVenues.map((venue) => {
              const isSelected = String(venue.id) === String(selectedVenueId);
              return (
                <button
                  key={venue.id}
                  type="button"
                  onClick={() => {
                    onSelectVenue(venue);
                    setVenueOpen(false);
                    setRaceOpen(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: isSelected ? "rgba(59, 130, 246, 0.18)" : "transparent",
                    border: "none",
                    color: isSelected ? "#60A5FA" : "#E2E8F0",
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                    fontFamily: "'Outfit','Inter',sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(59, 130, 246, 0.10)";
                      (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "#E2E8F0";
                    }
                  }}
                >
                  <span>{venue.venue}</span>
                  <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>
                    {venue.races.length} races
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── STAGE 2: Race Selector Block (rendered when venue is chosen) ── */}
      {selectedVenue && (
        <div ref={raceRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => {
              setRaceOpen((prev) => !prev);
              setVenueOpen(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={raceOpen}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 13px",
              borderRadius: 10,
              background: raceOpen ? "#1e1b4b" : "#121324",
              border: `1px solid ${raceOpen ? "rgba(139, 92, 246, 0.55)" : "rgba(148, 163, 184, 0.22)"}`,
              color: selectedRace ? "#F8FAFC" : "#94A3B8",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              boxShadow: raceOpen ? "0 0 14px rgba(139, 92, 246, 0.25)" : "0 2px 8px rgba(0, 0, 0, 0.25)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              fontFamily: "'Outfit','Inter',sans-serif",
              whiteSpace: "nowrap",
              width: "auto",
              maxWidth: 360,
            }}
            onMouseEnter={(e) => {
              if (!raceOpen) {
                (e.currentTarget as HTMLButtonElement).style.background = "#1c1d36";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139, 92, 246, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!raceOpen) {
                (e.currentTarget as HTMLButtonElement).style.background = "#121324";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(148, 163, 184, 0.22)";
              }
            }}
          >
            <Trophy size={13} style={{ color: selectedRace ? "#A78BFA" : "#94A3B8", flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{raceLabel}</span>
            <ChevronDown
              size={13}
              style={{
                color: "#94A3B8",
                transform: raceOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                flexShrink: 0,
              }}
            />
          </button>

          {raceOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                minWidth: 260,
                maxWidth: 380,
                background: "#121324",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                borderRadius: 12,
                padding: "6px",
                boxShadow: "0 16px 45px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                zIndex: 600,
                maxHeight: 280,
                overflowY: "auto",
              }}
            >
              <div style={{ padding: "4px 8px 6px", fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Races for {selectedVenue.venue}
              </div>
              {availableRaces.map((race) => {
                const isSelected = String(race.id) === String(selectedRaceId);
                const titleStr = race.title ? `: ${race.title}` : "";
                return (
                  <button
                    key={race.id}
                    type="button"
                    onClick={() => {
                      onSelectRace(race);
                      setRaceOpen(false);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: isSelected ? "rgba(139, 92, 246, 0.18)" : "transparent",
                      border: "none",
                      color: isSelected ? "#C4B5FD" : "#E2E8F0",
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      fontFamily: "'Outfit','Inter',sans-serif",
                      gap: 2,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(139, 92, 246, 0.10)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color = "#E2E8F0";
                      }
                    }}
                  >
                    <span style={{ fontWeight: 700, color: isSelected ? "#A78BFA" : "#FFFFFF" }}>
                      Race {race.race_number}{titleStr}
                    </span>
                    <span style={{ fontSize: 10.5, color: "#64748B" }}>
                      {race.distance ? `${race.distance} • ` : ""}{race.surface ? `${race.surface} • ` : ""}{race.runners ? `${race.runners} runners` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
