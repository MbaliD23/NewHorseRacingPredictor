import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "@/components/analytics/Analytics.module.css";
import {
  ALL_AXES,
  HORSES,
  horseColor,
  normMerit,
  TABLE_COLS,
  mapBackendHorsesToNormalized,
} from "@/lib/horseAnalytics";
import type { NormalizedHorse } from "@/types/horseAnalytics";
import type { Venue, RaceCard } from "@/types/race";
import { usePredictionStore } from "@/store/predictionStore";
import { useRaces } from "@/hooks/useRaces";
import { useRace } from "@/hooks/useRace";
import { ColorSwatch } from "@/components/analytics/ColorSwatch";
import { MetricsDropdown } from "@/components/analytics/MetricsDropdown";
import { RadarChart } from "@/components/analytics/RadarChart";
import { NavigationHeader } from "@/components/analytics/NavigationHeader";
import { VenueRaceSelector, FALLBACK_VENUES } from "@/components/analytics/VenueRaceSelector";
import { BackButton } from "@/components/navigation/BackButton";

const RADAR_MAX = 2;

export function RadarAnalyticsPage() {
  const navigate = useNavigate();
  const { currentVenue, currentRace, currentHorse, setCurrentVenue, setCurrentRace } = usePredictionStore();
  const { data: allVenues = [] } = useRaces();

  const effectiveVenues = useMemo(() => {
    return allVenues && allVenues.length > 0 ? allVenues : FALLBACK_VENUES;
  }, [allVenues]);

  // Stage 1 & 2 selection states
  const [selectedVenueId, setSelectedVenueId] = useState<number | string | null>(() => {
    if (currentVenue?.id) return currentVenue.id;
    if (currentRace?.venue) {
      const match = effectiveVenues.find((v) => v.venue.toLowerCase() === currentRace.venue.toLowerCase());
      if (match) return match.id;
    }
    return null;
  });

  const [selectedRaceId, setSelectedRaceId] = useState<number | string | null>(() => {
    if (currentRace?.id) return currentRace.id;
    if (currentHorse?.race_id) return currentHorse.race_id;
    return null;
  });

  const isRaceActive = Boolean(selectedVenueId && selectedRaceId);

  const { data: fetchedRace } = useRace(selectedRaceId ?? undefined);

  const activeRace = fetchedRace ?? (currentRace?.id === selectedRaceId ? currentRace : null);

  const dynamicHorses: NormalizedHorse[] = useMemo(() => {
    if (!isRaceActive) return [];
    if (activeRace?.horses && activeRace.horses.length > 0) {
      return mapBackendHorsesToNormalized(activeRace.horses);
    }
    return HORSES;
  }, [isRaceActive, activeRace?.horses]);

  // Handle Venue selection (resets race & horses)
  const handleSelectVenue = useCallback((venue: Venue) => {
    setSelectedVenueId(venue.id);
    setSelectedRaceId(null);
    setCurrentVenue(venue);
    setCurrentRace(null);
    setActiveHorseIds([]);
  }, [setCurrentVenue, setCurrentRace]);

  // Handle Race selection
  const handleSelectRace = useCallback((raceCard: RaceCard) => {
    setSelectedRaceId(raceCard.id);
  }, []);

  // Selection state
  const [activeHorseIds, setActiveHorseIds] = useState<number[]>([]);

  // Synchronize active horses when race is active
  useEffect(() => {
    if (isRaceActive && dynamicHorses.length > 0) {
      setActiveHorseIds((prev) => {
        const valid = prev.filter((id) => dynamicHorses.some((h) => h.id === id));
        if (valid.length > 0) return valid.slice(0, RADAR_MAX);
        return dynamicHorses.slice(0, RADAR_MAX).map((h) => h.id);
      });
    } else if (!isRaceActive) {
      setActiveHorseIds([]);
    }
  }, [isRaceActive, dynamicHorses]);

  const [activeMetricKeys, setActiveMetricKeys] = useState<Set<string>>(
    () => new Set(ALL_AXES.map((a) => a.key))
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* Toggle horse selection: max 2, keep at least 1 */
  const toggleHorse = useCallback((id: number) => {
    setActiveHorseIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= RADAR_MAX) {
        return [prev[prev.length - 1], id];
      }
      return [...prev, id];
    });
  }, []);

  const toggleMetric = useCallback((key: string) => {
    setActiveMetricKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size <= 2) return prev;
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const activeAxes = ALL_AXES.filter((ax) => activeMetricKeys.has(ax.key));
  const radarLimitReached = activeHorseIds.length >= RADAR_MAX;

  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = useCallback((colKey: string) => {
    setSortCol((prevCol) => {
      if (prevCol === colKey) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevCol;
      }
      setSortDir("desc");
      return colKey;
    });
  }, []);

  const sortedHorses = useMemo(() => {
    if (!sortCol) return dynamicHorses;
    return [...dynamicHorses].sort((a, b) => {
      let comparison = 0;
      if (sortCol === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortCol === "meritRating") {
        comparison = (a.meritRating ?? 0) - (b.meritRating ?? 0);
      } else if (
        sortCol === "totRns" ||
        sortCol === "crs" ||
        sortCol === "dst" ||
        sortCol === "cd" ||
        sortCol === "wet" ||
        sortCol === "jockeyPerf" ||
        sortCol === "trainerPerf"
      ) {
        comparison = (a.norm[sortCol as keyof typeof a.norm] ?? 0) - (b.norm[sortCol as keyof typeof b.norm] ?? 0);
      } else if (sortCol === "forecastOdds") {
        comparison = (a.norm.forecastOdds ?? 0) - (b.norm.forecastOdds ?? 0);
      }
      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [dynamicHorses, sortCol, sortDir]);

  const controlsHeader = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: "16px 20px 14px",
        borderBottom: "1px solid rgba(148,163,184,0.08)",
        gap: 12,
        boxSizing: "border-box",
        background: "#121324",
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* ── Top Row: [Back Button + Title "Head to Head Analysis"] on the left | [Venue & Race Selectors + Metrics Dropdown] on the right ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* Left: Back button & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BackButton to="/" fallbackTo="/" theme="dark" label="Go back" className="!h-8 !w-8 sm:!h-8 sm:!w-8" />

          <h2 className="text-lg font-bold text-white tracking-wide" style={{ margin: 0, color: "#FFFFFF" }}>
            Head to Head Analysis
          </h2>
        </div>

        {/* Right: Two-Stage Selection Blocks + Metrics Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
          <VenueRaceSelector
            venues={effectiveVenues}
            selectedVenueId={selectedVenueId}
            selectedRaceId={selectedRaceId}
            onSelectVenue={handleSelectVenue}
            onSelectRace={handleSelectRace}
          />
          <div style={{ position: "relative" }}>
            <MetricsDropdown
              activeKeys={activeMetricKeys}
              onToggle={toggleMetric}
              onBatchChange={setActiveMetricKeys}
              minSelected={2}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom Row: On Chart (Max 2) label + Horse selection chips or placeholder prompt ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          paddingLeft: 42,
          minHeight: 28,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#94A3B8",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          On Chart <span style={{ fontWeight: 400, color: "#475569" }}>(Max 2)</span>
        </span>
        {!selectedVenueId ? (
          <span style={{ fontSize: 11.5, color: "#64748B", fontStyle: "italic", fontFamily: "'Outfit','Inter',sans-serif" }}>
            Please select an event venue above to load races
          </span>
        ) : !selectedRaceId ? (
          <span style={{ fontSize: 11.5, color: "#64748B", fontStyle: "italic", fontFamily: "'Outfit','Inter',sans-serif" }}>
            Please select a race above to view runners
          </span>
        ) : dynamicHorses.length === 0 ? (
          <span style={{ fontSize: 11.5, color: "#64748B", fontStyle: "italic", fontFamily: "'Outfit','Inter',sans-serif" }}>
            No runners found for this race
          </span>
        ) : (
          dynamicHorses.map((horse, idx) => {
            const isSelected = activeHorseIds.includes(horse.id);
            const c = horse.color ?? horseColor(horse.id, idx);
            const displayNum = horse.runnerNumber ?? idx + 1;
            return (
              <button
                key={horse.id}
                type="button"
                onClick={() => toggleHorse(horse.id)}
                aria-pressed={isSelected}
                title={isSelected ? `Remove ${horse.name} from radar` : `Add ${horse.name} to radar (max 2)`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 10px 3px 4px",
                  borderRadius: 20,
                  border: `1px solid ${isSelected ? c + "88" : "rgba(148,163,184,0.14)"}`,
                  background: isSelected ? c + "22" : "rgba(148,163,184,0.06)",
                  boxShadow: isSelected ? `0 0 10px ${c}33` : "none",
                  opacity: isSelected ? 1 : 0.45,
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                  fontFamily: "'Outfit','Inter',sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: isSelected ? "#F1F5F9" : "#64748B",
                  userSelect: "none",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: isSelected ? c : "#475569",
                    boxShadow: isSelected ? `0 0 6px ${c}99` : "none",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#fff",
                    flexShrink: 0,
                    transition: "background 0.2s ease",
                  }}
                >
                  {displayNum}
                </span>
                {horse.name}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className={`${styles.page} ${mounted ? styles.pageVisible : ""}`}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.layout}>
        <NavigationHeader />

        {/* ═══════════ TOP CARD ═══════════ */}
        <div className={styles.topCard}>
          {controlsHeader}

          {/* Chart body */}
          <div className={styles.chartBody}>
            <div className={styles.chartCanvas}>
              {!isRaceActive ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#64748B",
                    gap: 12,
                    textAlign: "center",
                    padding: "40px 20px",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "rgba(59, 130, 246, 0.08)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    🏇
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#E2E8F0" }}>
                    {!selectedVenueId ? "Select an Event Venue to begin" : "Select a Race to view analytics"}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", maxWidth: 360, lineHeight: 1.5 }}>
                    {!selectedVenueId
                      ? "Choose a venue and race from the top controls to load runner benchmarks and view analytics."
                      : "Choose a race from the dropdown above to load horses and start comparing performance."}
                  </div>
                </div>
              ) : (
                <RadarChart activeHorseIds={activeHorseIds} activeAxes={activeAxes} horses={dynamicHorses} />
              )}
            </div>
          </div>
        </div>

        {/* ═══════════ BOTTOM CARD – Table ═══════════ */}
        <div className={styles.bottomCard}>
          <div className={styles.tableHeader}>
            <span className={styles.tableSectionTitle}>
              <span className={styles.tableTitleIconWrap}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="1" y="1" width="5" height="5" rx="1" fill="#3B82F6" />
                  <rect x="8" y="1" width="5" height="5" rx="1" fill="#3B82F6" opacity="0.5" />
                  <rect x="1" y="8" width="5" height="5" rx="1" fill="#3B82F6" opacity="0.5" />
                  <rect x="8" y="8" width="5" height="5" rx="1" fill="#3B82F6" />
                </svg>
              </span>
              RACE RECORD COMPARISON
            </span>
            <span className={styles.tableHint}>
              ★ Click row to toggle horse on radar (max 2)
            </span>
          </div>

          {!isRaceActive ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748B", fontSize: 12.5, fontStyle: "italic" }}>
              Please select an event venue and race above to compare runner records
            </div>
          ) : (
            <div className={styles.tableScroll}>
              <table
                className={styles.table}
                role="grid"
                aria-label="Race record comparison – click row to toggle horse on radar"
              >
                <thead>
                  <tr className={styles.thead}>
                    {TABLE_COLS.map((col) => {
                      const isSorted = sortCol === col.key;
                      return (
                        <th key={col.key} className={styles.th} onClick={() => handleSort(col.key)}>
                          <span className={styles.thInner}>
                            {col.label}
                            <svg
                              width="9"
                              height="9"
                              viewBox="0 0 9 9"
                              fill="none"
                              aria-hidden="true"
                              style={{
                                transform: isSorted && sortDir === "asc" ? "rotate(180deg)" : "none",
                                opacity: isSorted ? 1 : 0.4,
                                color: isSorted ? "#60A5FA" : "currentColor",
                                transition: "transform 0.15s ease, opacity 0.15s ease",
                              }}
                            >
                              <path
                                d="M4.5 1v7M2 4l2.5-3 2.5 3"
                                stroke="currentColor"
                                strokeWidth="1.1"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedHorses.map((horse, idx) => {
                    const isActive = activeHorseIds.includes(horse.id);
                    const color = horse.color ?? horseColor(horse.id, idx);
                    const isLimitedOut = radarLimitReached && !isActive;

                    return (
                      <tr
                        key={horse.id}
                        className={`${styles.tr} ${isActive ? styles.trActive : ""} ${isLimitedOut ? styles.trDimmed : ""}`}
                        onClick={() => toggleHorse(horse.id)}
                        tabIndex={0}
                        role="row"
                        aria-selected={isActive}
                        onKeyDown={(e) =>
                          (e.key === "Enter" || e.key === " ") && toggleHorse(horse.id)
                        }
                      >
                        {/* Horse name */}
                        <td className={styles.td}>
                          <div className={styles.horseNameCell}>
                            {isActive && (
                              <span
                                className={styles.selectedBar}
                                style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                              />
                            )}
                            <ColorSwatch color={color} size={8} />
                            <span
                              className={`${styles.horseName} ${isActive ? styles.horseNameActive : ""}`}
                              style={isActive ? { color } : {}}
                            >
                              {horse.name}
                            </span>
                            {isActive && (
                              <span
                                className={styles.activeBadge}
                                style={{
                                  color,
                                  borderColor: `${color}55`,
                                  background: `${color}18`,
                                }}
                              >
                                ON
                              </span>
                            )}
                          </div>
                        </td>

                        <td className={styles.td}>
                          <span
                            className={`${styles.perfBadge} ${isActive ? styles.perfBadgeActive : ""}`}
                            style={
                              isActive
                                ? { color, background: `${color}18`, borderColor: `${color}44` }
                                : {}
                            }
                          >
                            {horse.jockeyPerf}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span
                            className={`${styles.perfBadge}`}
                            style={
                              isActive
                                ? { color, background: `${color}18`, borderColor: `${color}44` }
                                : {
                                    color: "#94A3B8",
                                    background: "rgba(148,163,184,0.07)",
                                    borderColor: "rgba(148,163,184,0.15)",
                                  }
                            }
                          >
                            {horse.trainerPerf}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.statVal}>{horse.totRns}</span>
                        </td>
                        <td className={styles.td}>
                          <span
                            className={`${styles.oddsBadge} ${isActive ? styles.oddsBadgeActive : ""}`}
                            style={
                              isActive
                                ? { color, background: `${color}18`, borderColor: `${color}44` }
                              : {}
                            }
                          >
                            {horse.forecastOdds}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.statVal}>{horse.wet}</span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.statVal}>{horse.crs}</span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.statVal}>{horse.dst}</span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.statVal}>{horse.cd}</span>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.meritCell}>
                            <span
                              className={styles.meritVal}
                              style={isActive ? { color } : {}}
                            >
                              {horse.meritRating}
                            </span>
                            <div className={styles.meritBarTrack}>
                              <div
                                className={styles.meritBarFill}
                                style={{
                                  width: `${normMerit(horse.meritRating)}%`,
                                  background: isActive
                                    ? `linear-gradient(90deg, ${color}80, ${color})`
                                    : "linear-gradient(90deg, #33415566, #475569)",
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RadarAnalyticsPage;
