import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { MaskedLine } from "./recipeKit";
import { StudioPalette } from "../tokens/oklchPalettes";
import { SEMANTIC } from "../tokens/semanticColors";

export interface TitleCardParams {
  lines: string[];
  tone?: "dark" | "light";
  eyebrow?: string;
  /** Index of the line that gets the accent block behind it. */
  accentLine?: number;
}

/** Full-screen title: masked line reveals, one accent line, slow breathing scale. */
export const TitleCard: React.FC<{ params: TitleCardParams; palette: StudioPalette }> = ({ params, palette }) => {
  const frame = useCurrentFrame();
  const { width, durationInFrames } = useVideoConfig();
  const light = params.tone === "light";
  const bg = light ? "#F8FAFC" : palette.dominantBg;
  const fg = light ? "#0B1630" : "#F8FAFC";
  const fontPx = Math.round(width * 0.062);
  const breath = 1 + 0.025 * (frame / Math.max(1, durationInFrames));
  const lines = params.lines.slice(0, 3);

  return (
    <AbsoluteFill style={{ background: bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `scale(${breath})`, textAlign: "center" }}>
        {params.eyebrow ? (
          <div style={{ marginBottom: fontPx * 0.3 }}>
            <MaskedLine text={params.eyebrow} fontPx={fontPx * 0.32} delay={0} color={palette.mutedContextText} weight={500} />
          </div>
        ) : null}
        {lines.map((t, i) => {
          const accent = params.accentLine === i;
          return (
            <div
              key={i}
              style={{
                display: "inline-block",
                padding: accent ? `0 ${fontPx * 0.3}px` : 0,
                background: accent ? SEMANTIC.info : "transparent",
                borderRadius: fontPx * 0.18,
                margin: "0 auto",
              }}
            >
              <MaskedLine text={t} fontPx={fontPx} delay={4 + i * 5} color={accent ? "#F8FAFC" : fg} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
