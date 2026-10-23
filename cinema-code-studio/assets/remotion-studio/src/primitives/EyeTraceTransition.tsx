import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { STUDIO_EASINGS } from "../tokens/springPhysics";

interface EyeTraceTransitionProps {
  direction?: "right" | "up" | "none";
  enterFrames?: number;
  children: React.ReactNode;
}

/**
 * Velocity-matched directional mask reveal that physically carries the viewer's eye
 * when transitioning across large screen saccades.
 */
export const EyeTraceTransition: React.FC<EyeTraceTransitionProps> = ({
  direction = "none",
  enterFrames = 14,
  children,
}) => {
  const frame = useCurrentFrame();
  useVideoConfig();

  if (direction === "none" || enterFrames <= 0) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const progress = interpolate(frame, [0, enterFrames], [0, 1], {
    easing: STUDIO_EASINGS.cinemaOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const clipPath =
    direction === "right"
      ? `inset(0% ${(1 - progress) * 100}% 0% 0%)`
      : `inset(${(1 - progress) * 100}% 0% 0% 0%)`;

  return <AbsoluteFill style={{ clipPath }}>{children}</AbsoluteFill>;
};
