import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./Analytics.module.css";
import {
  ALL_AXES,
  HORSES,
  horseColor,
  normMerit,
  TABLE_COLS,
  mapBackendHorsesToNormalized,
} from "@/lib/horseAnalytics";
import type { NormalizedHorse } from "@/types/horseAnalytics";
import type { Horse } from "@/types/race";
import { usePredictionStore } from "@/store/predictionStore";
import { useRaces } from "@/hooks/useRaces";
import { useRace } from "@/hooks/useRace";
import { ColorSwatch } from "./ColorSwatch";
import { MetricsDropdown } from "./MetricsDropdown";
import { RadarChart } from "./RadarChart";
import { NavigationHeader } from "./NavigationHeader";

const RADAR_MAX = 2;

interface RadarAnalyticsViewProps {
  selectedHorseId?: number | string;
  selectedHorseName?: string;
  showNavigation?: boolean;
  isEmbedded?: boolean;
  horses?: Horse[];
  raceId?: number | string;
}

export function RadarAnalyticsView({
  selectedHorseId,
  selectedHorseName,
  showNavigation = false,
  isEmbedded = false,
  horses: explicitHorses,
  raceId,
}: RadarAnalyticsViewProps) {
  const { currentRace, currentHorse } = usePredictionStore();
  const { data: allVenues = [] } = useRaces();

  // Resolve the active race ID
  const activeRaceId = useMemo(() => {
    if (raceId) return String(raceId);
    if (currentRace?.id) return String(currentRace.id);
    if (currentHorse?.race_id) return String(currentHorse.race_id);
    if (allVenues.length > 0 && allVenues[0].races.length > 0) {
      return String(allVenues[0].races[0].id);
    }
    return undefined;
  }, [raceId, currentRace, currentHorse, allVenues]);

  const { data: fetchedRace } = useRace(activeRaceId);

  const dynamicHorses: NormalizedHorse[] = useMemo(() => {
    if (explicitHorses && explicitHorses.length > 0) {
      return mapBackendHorsesToNormalized(explicitHorses);
    }
    if (fetchedRace?.horses && fetchedRace.horses.length > 0) {
      return mapBackendHorsesToNormalized(fetchedRace.horses);
    }
    if (currentRace?.horses && currentRace.horses.length > 0) {
      return mapBackendHorsesToNormalized(currentRace.horses);
    }
    return HORSES;
  }, [explicitHorses, fetchedRace?.horses, currentRace?.horses]);

  const primaryHorseId = useMemo(() => {
    if (selectedHorseId !== undefined && selectedHorseId !== null) {
      const match = dynamicHorses.find((h) => String(h.id) === String(selectedHorseId));
      if (match) return match.id;
    }
    if (selectedHorseName) {
      const match = dynamicHorses.find(
        (h) => h.name.toLowerCase() === selectedHorseName.toLowerCase()
      );
      if (match) return match.id;
    }
    if (currentHorse) {
      const match = dynamicHorses.find((h) => h.id === currentHorse.id);
      if (match) return match.id;
    }
    return dynamicHorses[0]?.id ?? 1;
  }, [selectedHorseId, selectedHorseName, currentHorse, dynamicHorses]);

  const [activeHorseIds, setActiveHorseIds] = useState<number[]>([primaryHorseId]);
  const [activeMetricKeys, setActiveMetricKeys] = useState<Set<string>>(
    () => new Set(ALL_AXES.map((a) => a.key))
  );
  const [mounted, setMounted] = useState(false);

  // Synchronize active selection whenever primary horse or race roster changes
  useEffect(() => {
    setActiveHorseIds((prev) => {
      const validPrev = prev.filter((id) => dynamicHorses.some((h) => h.id === id));
      if (validPrev.includes(primaryHorseId)) {
        const secondary = validPrev.find((id) => id !== primaryHorseId);
        return secondary !== undefined ? [primaryHorseId, secondary] : [primaryHorseId];
      }
      const secondary = validPrev.find((id) => id !== primaryHorseId);
      return secondary !== undefined ? [primaryHorseId, secondary] : [primaryHorseId];
    });
  }, [primaryHorseId, dynamicHorses]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const toggleHorse = useCallback(
    (id: number) => {
      setActiveHorseIds((prev) => {
        if (prev.includes(id)) {
          if (prev.length <= 1) return prev;
          return prev.filter((x) => x !== id);
        }
        if (prev.length >= RADAR_MAX) {
          if (prev.includes(primaryHorseId)) {
            return [primaryHorseId, id];
          }
          return [prev[0], id];
        }
        return [...prev, id];
      });
    },
    [primaryHorseId]
  );

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

  /** Reusable table for both embedded + standalone */
  const tableSection = (
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
        <span className={styles.tableHint}>★ Click row to toggle horse on radar (max 2)</span>
      </div>
      <div className={styles.tableScroll}>
        <table className={styles.table} role="grid" aria-label="Race record comparison">
          <thead>
            <tr className={styles.thead}>
              {TABLE_COLS.map((col) => (
                <th key={col.key} className={styles.th}>
                  <span className={styles.thInner}>
                    {col.label}
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                      <path d="M4.5 1v7M2 4l2.5-3 2.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                    </svg>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dynamicHorses.map((horse, idx) => {
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
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleHorse(horse.id)}
                >
                  <td className={styles.td}>
                    <div className={styles.horseNameCell}>
                      {isActive && <span className={styles.selectedBar} style={{ background: color, boxShadow: `0 0 6px ${color}` }} />}
                      <ColorSwatch color={color} size={8} />
                      <span className={`${styles.horseName} ${isActive ? styles.horseNameActive : ""}`} style={isActive ? { color } : {}}>{horse.name}</span>
                      {isActive && <span className={styles.activeBadge} style={{ color, borderColor: `${color}55`, background: `${color}18` }}>ON</span>}
                    </div>
                  </td>
                  <td className={styles.td}><span className={`${styles.perfBadge} ${isActive ? styles.perfBadgeActive : ""}`} style={isActive ? { color, background: `${color}18`, borderColor: `${color}44` } : {}}>{horse.jockeyPerf}</span></td>
                  <td className={styles.td}><span className={styles.perfBadge} style={isActive ? { color, background: `${color}18`, borderColor: `${color}44` } : { color: "#94A3B8", background: "rgba(148,163,184,0.07)", borderColor: "rgba(148,163,184,0.15)" }}>{horse.trainerPerf}</span></td>
                  <td className={styles.td}><span className={styles.statVal}>{horse.totRns}</span></td>
                  <td className={styles.td}><span className={`${styles.oddsBadge} ${isActive ? styles.oddsBadgeActive : ""}`} style={isActive ? { color, background: `${color}18`, borderColor: `${color}44` } : {}}>{horse.forecastOdds}</span></td>
                  <td className={styles.td}><span className={styles.statVal}>{horse.wet}</span></td>
                  <td className={styles.td}><span className={styles.statVal}>{horse.crs}</span></td>
                  <td className={styles.td}><span className={styles.statVal}>{horse.dst}</span></td>
                  <td className={styles.td}><span className={styles.statVal}>{horse.cd}</span></td>
                  <td className={styles.td}>
                    <div className={styles.meritCell}>
                      <span className={styles.meritVal} style={isActive ? { color } : {}}>{horse.meritRating}</span>
                      <div className={styles.meritBarTrack}>
                        <div className={styles.meritBarFill} style={{ width: `${normMerit(horse.meritRating)}%`, background: isActive ? `linear-gradient(90deg, ${color}80, ${color})` : "linear-gradient(90deg, #33415566, #475569)" }} />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  /** Reusable horse pill controls header */
  const controlsHeader = (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      padding: "16px 20px 14px",
      borderBottom: "1px solid rgba(148,163,184,0.08)",
      gap: 12,
      flexWrap: "wrap" as const,
      boxSizing: "border-box" as const,
      background: "#131E2F",
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      position: "relative" as const,
      zIndex: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
          On Chart <span style={{ fontWeight: 400, color: "#475569" }}>(Max 2)</span>
        </span>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, alignItems: "center" }}>
          {dynamicHorses.map((horse, idx) => {
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
                  userSelect: "none" as const,
                }}
              >
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 18, height: 18, borderRadius: "50%",
                  background: isSelected ? c : "#475569",
                  boxShadow: isSelected ? `0 0 6px ${c}99` : "none",
                  fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0,
                  transition: "background 0.2s ease",
                }}>
                  {displayNum}
                </span>
                {horse.name}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ flexShrink: 0, position: "relative" as const }}>
        <MetricsDropdown activeKeys={activeMetricKeys} onToggle={toggleMetric} />
      </div>
    </div>
  );

  // ── Embedded: pure inline-style render – no CSS cascade conflicts ──
  if (isEmbedded) {
    return (
      <div style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        fontFamily: "'Outfit','Inter',sans-serif",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>
        {/* TOP CARD */}
        <div style={{
          background: "#131E2F",
          border: "1px solid rgba(148,163,184,0.10)",
          borderRadius: 18,
          boxShadow: "0 0 0 1px rgba(59,130,246,0.05), 0 20px 60px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.04)",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflow: "visible",
          position: "relative",
        }}>
          {controlsHeader}
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 12px 18px",
            boxSizing: "border-box",
            overflow: "hidden",
          }}>
            <div style={{ width: "100%", maxWidth: 490, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "0 auto" }}>
              <RadarChart activeHorseIds={activeHorseIds} activeAxes={activeAxes} horses={dynamicHorses} />
            </div>
          </div>
        </div>


        {tableSection}
      </div>
    );
  }

  // ── Standalone page render ──
  return (
    <div className={`${styles.page} ${mounted ? styles.pageVisible : ""}`}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.layout}>
        {showNavigation && <NavigationHeader />}
        <div className={styles.topCard}>
          {controlsHeader}
          <div className={styles.chartBody}>
            <div className={styles.chartCanvas}>
              <RadarChart activeHorseIds={activeHorseIds} activeAxes={activeAxes} horses={dynamicHorses} />
            </div>
          </div>
        </div>
        {tableSection}
      </div>
    </div>
  );
}

export default RadarAnalyticsView;
