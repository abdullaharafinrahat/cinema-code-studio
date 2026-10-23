import React from "react";
import { AbsoluteFill } from "remotion";
import { GradeMoodSpec } from "../types/timeline";

interface ColorGradeLayerProps {
  mood?: GradeMoodSpec;
  children: React.ReactNode;
}

/**
 * Zero-stall optical color temperature & split-tone layer.
 * Uses pure alpha-composited split-tone wash (avoiding full-screen CSS `filter:`
 * and `mix-blend-mode` offscreen buffer stalls on software Chromium renderers).
 */
export const ColorGradeLayer: React.FC<ColorGradeLayerProps> = ({ mood, children }) => {
  const temp = mood?.temperatureShift ?? 0.0;

  const tintColor =
    temp > 0.02
      ? `rgba(255, 190, 115, ${(Math.min(1, temp) * 0.045).toFixed(3)})`
      : temp < -0.02
      ? `rgba(95, 168, 255, ${(Math.min(1, Math.abs(temp)) * 0.045).toFixed(3)})`
      : "transparent";

  return (
    <AbsoluteFill>
      {children}
      {tintColor !== "transparent" && (
        <AbsoluteFill
          style={{
            backgroundColor: tintColor,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
