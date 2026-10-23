import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { StudioPalette } from "../tokens/oklchPalettes";
import { getSafeZone } from "../tokens/framingGrids";
import { SPRING_PRESETS } from "../tokens/springPhysics";
import { WordTimestamp } from "../types/timeline";

interface EditorialCaptionsProps {
  words?: WordTimestamp[];
  active: boolean;
  palette: StudioPalette;
  chunkSize?: number;
}

/**
 * Mayer's Dual-Channel-Compliant Word-Level Captions.
 * Automatically steps out of the way (`active === false`) during dense graphic takeovers,
 * groups spoken tokens into readable 4-word saccadic phrases, and highlights the active word.
 */
export const EditorialCaptions: React.FC<EditorialCaptionsProps> = ({
  words = [],
  active,
  palette,
  chunkSize = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  if (!active || words.length === 0) {
    return null;
  }

  const currentSec = frame / fps;
  const activeIdx = words.findIndex((w) => currentSec >= w.start && currentSec <= w.end + 0.08);
  if (activeIdx === -1) {
    return null;
  }

  const groupStart = Math.floor(activeIdx / chunkSize) * chunkSize;
  const phrase = words.slice(groupStart, groupStart + chunkSize);
  const safe = getSafeZone(width, height);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: safe.bottomPx + 18,
        paddingLeft: safe.leftPx,
        paddingRight: safe.rightPx,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px 14px",
          padding: "14px 26px",
          borderRadius: 14,
          backgroundColor: "rgba(13, 16, 23, 0.78)",
          backdropFilter: "blur(14px)",
          border: `1px solid ${palette.hairlineBorder}`,
        }}
      >
        {phrase.map((token, i) => {
          const globalIdx = groupStart + i;
          const isCurrent = globalIdx === activeIdx;
          const wordStartFrame = token.startFrame ?? Math.round(token.start * fps);
          const pop = isCurrent
            ? spring({
                frame: Math.max(0, frame - wordStartFrame),
                fps,
                config: SPRING_PRESETS.snappy,
              })
            : 0;

          return (
            <span
              key={`${globalIdx}-${token.word}`}
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: width > height ? 38 : 42,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: isCurrent ? palette.heroAccent : "#F2EFE9",
                transform: `scale(${1 + pop * 0.06})`,
                display: "inline-block",
              }}
            >
              {token.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
