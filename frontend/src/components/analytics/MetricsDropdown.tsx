import React, { useState, useEffect, useRef } from "react";
import styles from "./Analytics.module.css";
import { ALL_AXES } from "@/lib/horseAnalytics";

interface MetricsDropdownProps {
  activeKeys: Set<string>;
  onToggle: (key: string) => void;
}

export function MetricsDropdown({ activeKeys, onToggle }: MetricsDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const MIN_AXES = 2;

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
            <span className={styles.dropdownSubtitle}>Min 2 required</span>
          </div>
          <div className={styles.dropdownDivider} />
          {ALL_AXES.map((ax) => {
            const isActive = activeKeys.has(ax.key);
            const isDisabled = isActive && activeCount <= MIN_AXES;
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
                title={isDisabled ? "At least 2 metrics required" : ""}
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
          <div className={styles.dropdownDivider} />
          <div className={styles.dropdownFooter}>
            <button
              className={styles.dropdownFooterBtn}
              onClick={() =>
                ALL_AXES.forEach((ax) => {
                  if (!activeKeys.has(ax.key)) onToggle(ax.key);
                })
              }
              type="button"
            >
              Select All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
