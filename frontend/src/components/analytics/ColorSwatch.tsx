import React from "react";

interface ColorSwatchProps {
  color: string;
  size?: number;
}

export function ColorSwatch({ color, size = 10 }: ColorSwatchProps) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 6px ${color}99`,
        flexShrink: 0,
      }}
    />
  );
}
