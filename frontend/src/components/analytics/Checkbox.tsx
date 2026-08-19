import React from "react";
import styles from "./Analytics.module.css";

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  accentColor: string;
  label: string;
}

export function Checkbox({ id, checked, onChange, accentColor, label }: CheckboxProps) {
  return (
    <label className={styles.checkboxRow} htmlFor={id}>
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        className={`${styles.checkboxBox} ${checked ? styles.checkboxBoxChecked : ""}`}
        style={checked ? { borderColor: accentColor, background: `${accentColor}26` } : {}}
        onClick={onChange}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && onChange()}
        tabIndex={0}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <span className={styles.checkboxLabel} style={checked ? { color: "#E2E8F0" } : {}}>
        {label}
      </span>
    </label>
  );
}
