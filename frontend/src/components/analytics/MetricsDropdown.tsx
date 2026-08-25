import React, { useState, useEffect, useRef } from "react";
import styles from "./Analytics.module.css";
import { ALL_AXES } from "@/lib/horseAnalytics";

interface MetricsDropdownProps {
  activeKeys: Set<string>;
  onToggle: (key: string) => void;
  onBatchChange?: (keys: Set<string>) => void;
  minSelected?: number;
}

export function MetricsDropdown({
  activeKeys,
  onToggle,
  onBatchChange,
  minSelected = 2,
}: MetricsDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const activeCount = activeKeys.size;

  const handleSelectAll = () => {
    const allSet = new Set(ALL_AXES.map((ax) => ax.key));
    if (onBatchChange) {
      onBatchChange(allSet);
    } else {
      ALL_AXES.forEach((ax) => {
        if (!activeKeys.has(ax.key)) onToggle(ax.key);
      });
    }
  };

  const handleClearAll = () => {
    const defaultKeys = ALL_AXES.slice(0, minSelected).map((ax) => ax.key);
    const newSet = new Set(defaultKeys);
    if (onBatchChange) {
      onBatchChange(newSet);
    } else {
      ALL_AXES.forEach((ax) => {
        const shouldBeActive = defaultKeys.includes(ax.key);
        const isCurrentlyActive = activeKeys.has(ax.key);
        if (shouldBeActive && !isCurrentlyActive) {
          onToggle(ax.key);
        } else if (!shouldBeActive && isCurrentlyActive) {
          onToggle(ax.key);
        }
      });
    }
  };

  return (
    <div className={styles.dropdownWrap} ref={wrapRef}>
      <button
        className={`${styles.dropdownTrigger} ${open ? styles.dropdownTriggerOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        id="metrics-filter-btn"
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Filter Metrics
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className={styles.dropdownCount}>
          {activeCount}/{ALL_AXES.length}
        </span>
      </button>
      {open && (
        <div
          className={styles.dropdownPanel}
          role="listbox"
          aria-multiselectable="true"
          aria-label="Toggle chart metrics"
        >
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Active Metrics</span>
            <span className={styles.dropdownSubtitle}>Min {minSelected} required</span>
          </div>

          {/* Quick-action batch controls placed side-by-side above the metric checkbox list */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-700/40">
            <button
              type="button"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-blue-950/40 cursor-pointer"
              onClick={handleSelectAll}
            >
              Select All
            </button>
            <button
              type="button"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-blue-950/40 cursor-pointer"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>

          <div className="pt-1">
            {ALL_AXES.map((ax) => {
              const isActive = activeKeys.has(ax.key);
              const isDisabled = isActive && activeCount <= minSelected;
              return (
                <button
                  key={ax.key}
                  role="option"
                  aria-selected={isActive}
                  className={`${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ""} ${
                    isDisabled ? styles.dropdownItemDisabled : ""
                  }`}
                  onClick={() => !isDisabled && onToggle(ax.key)}
                  tabIndex={0}
                  type="button"
                  title={isDisabled ? `At least ${minSelected} metric${minSelected > 1 ? "s" : ""} required` : ""}
                >
                  <span className={`${styles.dropdownCheck} ${isActive ? styles.dropdownCheckActive : ""}`}>
                    {isActive && (
                      <svg width="8" height="7" viewBox="0 0 8 7" fill="none" aria-hidden="true">
                        <path
                          d="M1 3.5L3 5.5L7 1"
                          stroke="#3B82F6"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className={styles.dropdownItemLabel}>{ax.label}</span>
                  {isActive && <span className={styles.dropdownActivePip} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
