import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING_PRESETS } from "../tokens/springPhysics";

interface KineticTypographyProps {
  lines: string[];
  color: string;
  accentWord?: string;
  accentColor?: string;
  fontSizePx?: number;
  fontFamily?: string;
  staggerFrames?: number;
  /** Offset frame clock forward so Frame 0 starts in-medias-res for hook survival */
  frameZeroLead?: number;
  align?: "left" | "center";
}

/**
 * Editorial masked line-by-line kinetic typography.
 * Includes descender-safe mask padding (`0.14em`) so g/j/p/y never clip,
 * tabular-nums enforcement, and single-hero accent word highlighting.
 */
export const KineticTypography: React.FC<KineticTypographyProps> = ({
  lines,
  color,
  accentWord,
  accentColor = "#C8963E",
  fontSizePx = 76,
  fontFamily = "Inter, system-ui, sans-serif",
  staggerFrames = 4,
  frameZeroLead = 0,
  align = "left",
}) => {
  const rawFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = rawFrame + frameZeroLead;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        gap: Math.round(fontSizePx * 0.08),
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {lines.map((line, idx) => {
        const reveal = spring({
          frame: frame - idx * staggerFrames,
          fps,
          config: SPRING_PRESETS.editorial,
        });
        const yPct = interpolate(reveal, [0, 1], [108, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const tilt = interpolate(reveal, [0, 1], [1.4, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const tokens = line.split(" ");
        return (
          <div
            key={`${idx}-${line}`}
            style={{
              overflow: "hidden",
              paddingBottom: "0.14em",
              marginBottom: "-0.10em",
            }}
          >
            <div
              style={{
                transform: `translateY(${yPct}%) rotate(${tilt}deg)`,
                transformOrigin: "left bottom",
                fontFamily,
                fontSize: fontSizePx,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.06,
                color,
              }}
            >
              {tokens.map((tok, tIdx) => {
                const clean = tok.replace(/[^\w%+.-]/g, "");
                const isAccent =
                  accentWord && clean.toLowerCase() === accentWord.toLowerCase();
                return (
                  <span
                    key={tIdx}
                    style={{
                      color: isAccent ? accentColor : color,
                    }}
                  >
                    {tok}
                    {tIdx < tokens.length - 1 ? " " : ""}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
