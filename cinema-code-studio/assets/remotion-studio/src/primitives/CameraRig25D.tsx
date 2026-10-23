import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SPRING_PRESETS } from "../tokens/springPhysics";

export interface CameraKeyframe {
  frame: number;
  x?: number;
  y?: number;
  zoom?: number;
  rotateDeg?: number;
}

interface CameraRig25DProps {
  keyframes?: CameraKeyframe[];
  /** Subtle ambient drift so settled frames stay alive (default 0.025) */
  ambientBreathScale?: number;
  children: React.ReactNode;
}

/**
 * Motivated 2.5D virtual world camera rig.
 * Smoothly interpolates pan, zoom, and Dutch-tilt keyframes with heavy cinema inertia,
 * plus an organic micro-breath drift so frames never freeze into dead screenshots.
 */
export const CameraRig25D: React.FC<CameraRig25DProps> = ({
  keyframes = [],
  ambientBreathScale = 0.025,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  let panX = 0;
  let panY = 0;
  let zoom = 1;
  let rot = 0;

  if (keyframes.length >= 2) {
    for (let i = 0; i < keyframes.length - 1; i++) {
      const curr = keyframes[i];
      const next = keyframes[i + 1];
      if (frame >= curr.frame) {
        const progress = spring({
          frame: frame - curr.frame,
          fps,
          config: SPRING_PRESETS.heavyCinema,
          durationInFrames: Math.max(12, next.frame - curr.frame),
        });
        panX = interpolate(progress, [0, 1], [curr.x ?? 0, next.x ?? 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        panY = interpolate(progress, [0, 1], [curr.y ?? 0, next.y ?? 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        zoom = interpolate(progress, [0, 1], [curr.zoom ?? 1, next.zoom ?? 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        rot = interpolate(
          progress,
          [0, 1],
          [curr.rotateDeg ?? 0, next.rotateDeg ?? 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
      }
    }
  }

  const breath = interpolate(
    frame,
    [0, Math.max(1, durationInFrames)],
    [1.0, 1.0 + ambientBreathScale],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        transform: `translate3d(${-panX}px, ${-panY}px, 0) scale(${zoom * breath}) rotate(${rot}deg)`,
        transformOrigin: "50% 46%",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
