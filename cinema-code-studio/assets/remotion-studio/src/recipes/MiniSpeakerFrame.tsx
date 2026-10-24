import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FootageCut } from "../primitives/FootageCut";
import { FootageSpec } from "../types/timeline";
import { Pill, useEnter } from "./recipeKit";
import { StudioPalette } from "../tokens/oklchPalettes";

export interface MiniSpeakerFrameParams {
  chip: string;
}

/**
 * Speaker shrinks into a rounded frame on a flat tonal-block background, with one label chip above.
 * Used for chapter/section moments ("Module 3", "Top 1% editor"). Needs scene.footage.
 */
export const MiniSpeakerFrame: React.FC<{ params: MiniSpeakerFrameParams; footage: FootageSpec; palette: StudioPalette }> = ({
  params,
  footage,
  palette,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const p = useEnter(0, "editorial");
  const size = width * 0.2;
  const drift = (frame / 60) * 6;

  const blocks = [
    { x: 0.12, y: 0.62, s: 0.07, a: 0.5 },
    { x: 0.78, y: 0.22, s: 0.05, a: 0.4 },
    { x: 0.66, y: 0.7, s: 0.09, a: 0.3 },
  ];

  return (
    <AbsoluteFill style={{ background: palette.dominantBg }}>
      {blocks.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${b.x * 100}%`,
            top: `${b.y * 100}%`,
            width: width * b.s,
            height: width * b.s,
            background: palette.heroAccent,
            opacity: b.a * p,
            transform: `translate(${i % 2 ? -drift : drift}px, ${drift * 0.5}px)`,
          }}
        />
      ))}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            position: "relative",
            width: size,
            height: size,
            borderRadius: size * 0.1,
            overflow: "hidden",
            transform: `scale(${interpolate(p, [0, 1], [1.6, 1])})`,
            boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
          }}
        >
          <FootageCut footage={{ ...footage, scale: 1.3 }} />
        </div>
      </AbsoluteFill>
      <Pill
        text={params.chip}
        tone="white"
        surface={palette.secondarySurface}
        fontPx={Math.round(width * 0.022)}
        delay={6}
        style={{ left: "50%", top: "30%", marginLeft: -width * 0.08 }}
      />
    </AbsoluteFill>
  );
};
