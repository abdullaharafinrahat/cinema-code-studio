import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { StudioPalette } from "../tokens/oklchPalettes";
import { getSafeZone } from "../tokens/framingGrids";
import { SPRING_PRESETS } from "../tokens/springPhysics";
import { KineticTypography } from "./KineticTypography";

interface ComparativeBarItem {
  label: string;
  value: number;
  unit?: string;
  isHero?: boolean;
}

interface VisualMetaphorStageProps {
  archetype?: "HERO_STATEMENT" | "COMPARATIVE_BARS" | "TERMINAL_FLOW" | "METRIC_PROOF";
  palette: StudioPalette;
  props?: Record<string, unknown>;
  isFirstScene?: boolean;
}

/**
 * Composable Motion Graphics Stage enforcing:
 * - >= 40% uncluttered negative space
 * - 60-30-10 OKLCH hierarchy (inactive comparison items stay muted; ONLY hero lights up)
 * - Tabular numerals on rolling metrics
 * - Frame-0 in-medias-res lead on Shot S01
 */
export const VisualMetaphorStage: React.FC<VisualMetaphorStageProps> = ({
  archetype = "HERO_STATEMENT",
  palette,
  props = {},
  isFirstScene = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const safe = getSafeZone(width, height);
  const lead = isFirstScene ? 12 : 0;

  const eyebrow = (props.eyebrow as string) || "";
  const lines = (props.lines as string[]) || ["Precision in Every Frame"];
  const accentWord = (props.accentWord as string) || undefined;
  const subcaption = (props.subcaption as string) || "";

  const containerReveal = spring({
    frame: frame + lead,
    fps,
    config: SPRING_PRESETS.editorial,
  });

  if (archetype === "COMPARATIVE_BARS") {
    const bars = (props.bars as ComparativeBarItem[]) || [
      { label: "Legacy GUI Timeline", value: 42, unit: "min", isHero: false },
      { label: "Deterministic Code Studio", value: 4, unit: "min", isHero: true },
    ];
    const maxVal = Math.max(1, ...bars.map((b) => b.value));

    return (
      <AbsoluteFill
        style={{
          backgroundColor: palette.dominantBg,
          paddingTop: safe.topPx,
          paddingBottom: safe.bottomPx,
          paddingLeft: safe.leftPx,
          paddingRight: safe.rightPx,
          justifyContent: "center",
        }}
      >
        {eyebrow && (
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 20,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: palette.mutedContextText,
              marginBottom: 18,
              opacity: containerReveal,
            }}
          >
            {eyebrow}
          </div>
        )}
        <KineticTypography
          lines={lines}
          color={palette.primaryText}
          accentWord={accentWord}
          accentColor={palette.heroAccent}
          fontSizePx={width > height ? 64 : 52}
          frameZeroLead={lead}
        />

        <div style={{ marginTop: 52, display: "flex", flexDirection: "column", gap: 28, maxWidth: "82%" }}>
          {bars.map((bar, idx) => {
            const barSpring = spring({
              frame: frame + lead - (10 + idx * 8),
              fps,
              config: bar.isHero ? SPRING_PRESETS.tactile : SPRING_PRESETS.editorial,
            });
            const pct = interpolate(barSpring, [0, 1], [0, (bar.value / maxVal) * 100], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const shownVal = Math.round(
              interpolate(barSpring, [0, 1], [0, bar.value], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            );

            return (
              <div key={bar.label} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 22,
                    fontVariantNumeric: "tabular-nums",
                    color: bar.isHero ? palette.primaryText : palette.mutedContextText,
                  }}
                >
                  <span>{bar.label}</span>
                  <span style={{ color: bar.isHero ? palette.heroAccent : palette.mutedContextText, fontWeight: 700 }}>
                    {shownVal}
                    {bar.unit ? ` ${bar.unit}` : ""}
                  </span>
                </div>
                <div
                  style={{
                    height: 22,
                    borderRadius: 6,
                    backgroundColor: palette.secondarySurface,
                    border: `1px solid ${palette.hairlineBorder}`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      borderRadius: 5,
                      backgroundColor: bar.isHero ? palette.heroAccent : palette.mutedContextText,
                      opacity: bar.isHero ? 1 : 0.42,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  if (archetype === "METRIC_PROOF") {
    const targetValue = Number(props.metricValue ?? 340);
    const prefix = String(props.metricPrefix ?? "+");
    const suffix = String(props.metricSuffix ?? "%");
    const countSpring = spring({
      frame: frame + lead - 4,
      fps,
      config: SPRING_PRESETS.tactile,
    });
    const currentNumber = Math.round(
      interpolate(countSpring, [0, 1], [0, targetValue], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );

    return (
      <AbsoluteFill
        style={{
          backgroundColor: palette.dominantBg,
          padding: `${safe.topPx}px ${safe.rightPx}px ${safe.bottomPx}px ${safe.leftPx}px`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            padding: "48px 72px",
            borderRadius: 20,
            backgroundColor: palette.secondarySurface,
            border: `1px solid ${palette.hairlineBorder}`,
            boxShadow: `0 28px 80px rgba(0,0,0,0.42)`,
            textAlign: "center",
            transform: `scale(${interpolate(containerReveal, [0, 1], [0.94, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })})`,
          }}
        >
          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: width > height ? 148 : 112,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: palette.heroAccent,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            {prefix}
            {currentNumber}
            {suffix}
          </div>
          <div
            style={{
              marginTop: 22,
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 32,
              fontWeight: 600,
              color: palette.primaryText,
            }}
          >
            {lines.join(" ")}
          </div>
          {subcaption && (
            <div
              style={{
                marginTop: 10,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 18,
                color: palette.mutedContextText,
              }}
            >
              {subcaption}
            </div>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // Default: HERO_STATEMENT (Swiss Editorial Typography Lockup)
  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.dominantBg,
        paddingTop: safe.topPx,
        paddingBottom: safe.bottomPx,
        paddingLeft: safe.leftPx,
        paddingRight: safe.rightPx,
        justifyContent: "center",
      }}
    >
      {/* Subtle architectural hairline axis */}
      <div
        style={{
          position: "absolute",
          left: safe.leftPx,
          right: safe.rightPx,
          top: safe.topPx,
          height: 1,
          backgroundColor: palette.hairlineBorder,
        }}
      />
      {eyebrow && (
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            padding: "6px 14px",
            borderRadius: 999,
            backgroundColor: palette.heroAccentSoft,
            color: palette.heroAccent,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 24,
            opacity: containerReveal,
          }}
        >
          {eyebrow}
        </div>
      )}
      <KineticTypography
        lines={lines}
        color={palette.primaryText}
        accentWord={accentWord}
        accentColor={palette.heroAccent}
        fontSizePx={width > height ? 84 : 62}
        frameZeroLead={lead}
      />
      {subcaption && (
        <div
          style={{
            marginTop: 28,
            maxWidth: 780,
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 28,
            lineHeight: 1.4,
            color: palette.mutedContextText,
            opacity: interpolate(frame + lead, [8, 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {subcaption}
        </div>
      )}
    </AbsoluteFill>
  );
};
