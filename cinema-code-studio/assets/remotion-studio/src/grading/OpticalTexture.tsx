import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

interface OpticalTextureProps {
  grainOpacity?: number;
  vignetteStrength?: number;
}

/**
 * High-speed deterministic 35mm optical vignette & micro-grain layer.
 * Avoids software-CPU SVG <feTurbulence> and mix-blend-mode backdrop readbacks
 * (which stall headless Chromium by ~950ms/frame at 1080p!), using a
 * lightweight stepped spatial dither pattern + radial lens vignette instead.
 */
export const OpticalTexture: React.FC<OpticalTextureProps> = ({
  grainOpacity = 0.035,
  vignetteStrength = 0.14,
}) => {
  const frame = useCurrentFrame();
  const shiftX = (frame * 29) % 64;
  const shiftY = (frame * 43) % 64;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {grainOpacity > 0 && (
        <AbsoluteFill
          style={{
            opacity: grainOpacity,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.45) 1px, transparent 0), radial-gradient(rgba(0,0,0,0.55) 1px, transparent 0)",
            backgroundSize: "6px 6px, 9px 9px",
            backgroundPosition: `${shiftX}px ${shiftY}px, ${-shiftY}px ${shiftX}px`,
          }}
        />
      )}
      {vignetteStrength > 0 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 56%, rgba(0,0,0,${vignetteStrength}) 100%)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
