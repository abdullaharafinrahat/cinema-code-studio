import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FootageSpec } from "../types/timeline";

interface FootageCutProps {
  footage: FootageSpec;
}

/**
 * Frame-accurate <OffthreadVideo> wrapper implementing real editor techniques:
 * 1. Eye-anchored scale punch-ins (`anchorEye: [ex, ey]`) so 1.0x <-> 1.15x jump-cut
 *    alternations keep the speaker's eye-line locked without vertical head-bob.
 * 2. Subtle organic camera drift so talking-head shots never feel dead.
 */
export const FootageCut: React.FC<FootageCutProps> = ({ footage }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const baseScale = footage.scale ?? 1.0;
  const [eyeX, eyeY] = footage.anchorEye ?? [0.5, 0.36];
  const drift = interpolate(frame, [0, Math.max(1, durationInFrames)], [1.0, 1.02], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const videoSrc = footage.src.startsWith("http")
    ? footage.src
    : staticFile(footage.src.replace(/^public\//, ""));

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0D1017" }}>
      <OffthreadVideo
        src={videoSrc}
        startFrom={footage.trimBeforeFrames ?? 0}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${baseScale * drift})`,
          transformOrigin: `${(eyeX * 100).toFixed(1)}% ${(eyeY * 100).toFixed(1)}%`,
        }}
      />
    </AbsoluteFill>
  );
};
