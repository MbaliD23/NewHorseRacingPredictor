import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Analytics.module.css";

export function NavigationHeader() {
  return (
    <div className={styles.navContainer}>
      <nav className={styles.navBar} aria-label="Analytics view navigation">
        <NavLink
          to="/radar-analytics"
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
          }
        >
          <span style={{ fontSize: "14px", lineHeight: 1 }}>◎</span>
          <span>Head to Head Analysis</span>
        </NavLink>
        <NavLink
          to="/bar-analytics"
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
          }
        >
          <span style={{ fontSize: "14px", lineHeight: 1 }}>▮</span>
          <span>5-Horse Comparison</span>
        </NavLink>
      </nav>
    </div>
  );
}
