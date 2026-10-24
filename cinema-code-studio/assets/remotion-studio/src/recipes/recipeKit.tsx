import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING_PRESETS } from "../tokens/springPhysics";
import { fontFor, lineHeightFor } from "../fonts";
import { Tone, toneColors } from "../tokens/semanticColors";

/** 0 -> 1 entrance progress for an element that starts at `delay` frames. */
export const useEnter = (delay: number, preset: keyof typeof SPRING_PRESETS = "tactile"): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: SPRING_PRESETS[preset] });
};

/** Slow float so a settled element is never a frozen screenshot (motion principle D). */
export const useAmbient = (seed: number, amp = 3): number => {
  const frame = useCurrentFrame();
  return Math.sin((frame + seed * 17) / 18) * amp;
};

export interface PillProps {
  text: string;
  tone: Tone;
  surface: string;
  fontPx: number;
  delay: number;
  /** Optional leading mark: "x" or "check" or "dot". */
  mark?: "x" | "check" | "dot";
  style?: React.CSSProperties;
}

/** Flat, solid pill. No glow, no gradient: a soft neutral shadow only. */
export const Pill: React.FC<PillProps> = ({ text, tone, surface, fontPx, delay, mark, style }) => {
  const p = useEnter(delay);
  const float = useAmbient(delay);
  const { bg, fg } = toneColors(tone, surface);
  const markGlyph = mark === "x" ? "\u2715" : mark === "check" ? "\u2713" : mark === "dot" ? "\u25CF" : null;
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: fontPx * 0.4,
        padding: `${fontPx * 0.28}px ${fontPx * 0.6}px`,
        borderRadius: fontPx * 0.5,
        background: bg,
        color: fg,
        fontFamily: fontFor(text),
        fontWeight: 700,
        fontSize: fontPx,
        lineHeight: lineHeightFor(text),
        whiteSpace: "nowrap",
        boxShadow: "0 10px 24px rgba(0,0,0,0.28)",
        opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `translateY(${(1 - p) * 22 + float}px) scale(${0.9 + 0.1 * p})`,
        ...style,
      }}
    >
      {markGlyph ? <span style={{ fontSize: fontPx * 0.8 }}>{markGlyph}</span> : null}
      <span>{text}</span>
    </div>
  );
};

/** One headline line revealed through an overflow mask (never a plain opacity fade). */
export const MaskedLine: React.FC<{
  text: string;
  fontPx: number;
  delay: number;
  color: string;
  weight?: number;
}> = ({ text, fontPx, delay, color, weight = 700 }) => {
  const p = useEnter(delay, "editorial");
  const lh = lineHeightFor(text);
  return (
    <div style={{ overflow: "hidden", paddingBottom: `${lh > 1.2 ? 0.2 : 0.12}em` }}>
      <div
        style={{
          fontFamily: fontFor(text),
          fontWeight: weight,
          fontSize: fontPx,
          lineHeight: lh,
          color,
          transform: `translateY(${(1 - p) * 108}%) rotate(${(1 - p) * 1.5}deg)`,
          transformOrigin: "0% 100%",
        }}
      >
        {text}
      </div>
    </div>
  );
};
