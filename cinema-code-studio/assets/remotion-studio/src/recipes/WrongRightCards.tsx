import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Pill } from "./recipeKit";
import { StudioPalette } from "../tokens/oklchPalettes";
import { Box, DEFAULT_FACE_BOX, estimatePillWidth, placePills } from "../tokens/faceSafe";

export interface WrongRightCardsParams {
  wrong: string[];
  right?: string[];
  /** Frame (scene-local) where the red "wrong" cards are replaced by lime "right" cards. */
  flipAtFrame?: number;
  faceBox?: Box;
}

/**
 * "Not this, this." Red cards with an x for what is wrong, then lime cards with a check.
 * Meaning colors are the point, so this recipe is the one place red is expected.
 */
export const WrongRightCards: React.FC<{ params: WrongRightCardsParams; palette: StudioPalette }> = ({
  params,
  palette,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fontPx = Math.round(width * 0.028);
  const face = params.faceBox ?? DEFAULT_FACE_BOX;
  const flipAt = params.flipAtFrame ?? 60;
  const showRight = !!params.right?.length && frame >= flipAt;
  const items = (showRight ? params.right! : params.wrong).slice(0, 4);

  const sizes = items.map((t) => ({
    w: estimatePillWidth(t, fontPx, width, fontPx * 0.6) + (fontPx * 1.2) / width,
    h: (fontPx * 1.4 + fontPx * 0.56) / height,
  }));
  const placed = placePills(sizes, face);
  const localDelay = showRight ? flipAt : 0;

  return (
    <AbsoluteFill>
      {items.map((t, i) => (
        <Pill
          key={`${showRight ? "r" : "w"}-${i}`}
          text={t}
          tone={showRight ? "lime" : "red"}
          surface={palette.secondarySurface}
          fontPx={fontPx * placed.scale}
          delay={localDelay + i * 7}
          mark={showRight ? "check" : "x"}
          style={{ left: `${placed.items[i].x * 100}%`, top: `${placed.items[i].y * 100}%` }}
        />
      ))}
    </AbsoluteFill>
  );
};
