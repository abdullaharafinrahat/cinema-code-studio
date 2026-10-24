import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { MaskedLine, useEnter } from "./recipeKit";
import { StudioPalette } from "../tokens/oklchPalettes";
import { SEMANTIC } from "../tokens/semanticColors";
import { fontFor } from "../fonts";

export interface StepLabelsParams {
  steps: Array<{ label: string }>;
  /** Frames each step stays the active (full brightness) one. */
  holdFrames?: number;
  eyebrow?: string;
}

const STEP_FILLS = [SEMANTIC.success, SEMANTIC.info, "#F8FAFC"];


const StepCard: React.FC<{
  index: number;
  label: string;
  hold: number;
  dimmed: boolean;
  fontPx: number;
  width: number;
}> = ({ index, label, hold, dimmed, fontPx, width }) => {
  const p = useEnter(index * hold);
  const fill = STEP_FILLS[index % STEP_FILLS.length];
  const fg = fill === SEMANTIC.info ? "#F8FAFC" : "#0B1630";
  return (
    <div
      style={{
        width: width * 0.24,
        padding: `${fontPx * 0.9}px ${fontPx * 1.1}px`,
        borderRadius: fontPx * 0.7,
        background: fill,
        color: fg,
        opacity: interpolate(p, [0, 0.35], [0, dimmed ? 0.45 : 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + 0.06 * p})`,
        boxShadow: "0 14px 30px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ fontFamily: fontFor("Step"), fontSize: fontPx * 0.55, fontWeight: 500, opacity: 0.7 }}>
        {`Step ${index + 1}`}
      </div>
      <div style={{ fontFamily: fontFor(label), fontSize: fontPx, fontWeight: 700, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
};

/**
 * Sequential steps (2-4). Reveals one at a time and dims earlier ones to 45% so attention
 * follows the active step (three-chunk working-memory rule). Flat fills, no connector circuitry.
 */
export const StepLabels: React.FC<{ params: StepLabelsParams; palette: StudioPalette }> = ({ params, palette }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const steps = params.steps.slice(0, 4);
  const hold = params.holdFrames ?? 28;
  const fontPx = Math.round(width * 0.03);
  const active = Math.min(steps.length - 1, Math.floor(frame / hold));

  return (
    <AbsoluteFill style={{ background: palette.dominantBg, justifyContent: "center", alignItems: "center" }}>
      {params.eyebrow ? (
        <div style={{ position: "absolute", top: "18%" }}>
          <MaskedLine text={params.eyebrow} fontPx={fontPx * 0.8} delay={0} color={palette.mutedContextText} weight={500} />
        </div>
      ) : null}
      <div style={{ display: "flex", gap: width * 0.018 }}>
        {steps.map((s, i) => (
          <StepCard key={i} index={i} label={s.label} hold={hold} dimmed={i < active} fontPx={fontPx} width={width} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
