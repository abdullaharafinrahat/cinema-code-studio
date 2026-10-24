import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Pill } from "./recipeKit";
import { Tone } from "../tokens/semanticColors";
import { StudioPalette } from "../tokens/oklchPalettes";
import { Box, DEFAULT_FACE_BOX, estimatePillWidth, placePills } from "../tokens/faceSafe";

export interface SpeakerOrbitPillsParams {
  pills: Array<{ text: string; tone?: Tone }>;
  faceBox?: Box;
  /** Frames between pill entrances. Total entrance stays under ~34 frames. */
  staggerFrames?: number;
}

const DEFAULT_TONES: Tone[] = ["white", "lime", "cobalt", "dark"];

/**
 * Keyword pills that orbit the speaker, placed in the free columns beside the face.
 * Layer this over the speaker footage (scene.footage). Pills never overlap `faceBox`.
 */
export const SpeakerOrbitPills: React.FC<{ params: SpeakerOrbitPillsParams; palette: StudioPalette }> = ({
  params,
  palette,
}) => {
  const { width, height } = useVideoConfig();
  const pills = params.pills.slice(0, 4);
  const fontPx = Math.round(width * 0.026);
  const padPx = fontPx * 0.6;
  const face = params.faceBox ?? DEFAULT_FACE_BOX;
  const stagger = Math.min(params.staggerFrames ?? 8, 10);

  const sizes = pills.map((p) => ({
    w: estimatePillWidth(p.text, fontPx, width, padPx) + (fontPx * 0.9) / width,
    h: (fontPx * 1.4 + fontPx * 0.56) / height,
  }));
  const placed = placePills(sizes, face);

  return (
    <AbsoluteFill>
      {pills.map((p, i) => {
        const pl = placed.items[i];
        return (
          <Pill
            key={`${p.text}-${i}`}
            text={p.text}
            tone={p.tone ?? DEFAULT_TONES[i % DEFAULT_TONES.length]}
            surface={palette.secondarySurface}
            fontPx={fontPx * placed.scale}
            delay={i * stagger}
            mark="dot"
            style={{ left: `${pl.x * 100}%`, top: `${pl.y * 100}%` }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
