import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONTS } from "../fonts";

export const EASE_COMMERCIAL = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT_SNAP = Easing.bezier(0.76, 0, 0.24, 1);

/**
 * 1. Animated Corner Light-Sweep Viewport.
 * Traces a glowing ice-white & cobalt highlight around rounded corners with soft optical bloom + '+' reticles.
 */
export const GlowSweepFrame: React.FC<{
  width: number;
  height: number;
  radius?: number;
  sweepColor?: string;
  bg?: string;
  showReticles?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({
  width,
  height,
  radius = 24,
  sweepColor = "#60A5FA",
  bg = "rgba(8, 17, 38, 0.86)",
  showReticles = false,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const perim = 2 * (width + height);
  const segLen = perim * 0.22;
  const dashOffset = -((frame * 18) % perim);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: radius,
        backgroundColor: bg,
        boxShadow:
          "0 30px 80px rgba(2, 8, 23, 0.72), 0 0 42px rgba(29, 99, 237, 0.22), inset 0 1px 0 rgba(255,255,255,0.14)",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      <svg
        width={width + 24}
        height={height + 24}
        style={{
          position: "absolute",
          left: -12,
          top: -12,
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <rect
          x={12}
          y={12}
          width={width}
          height={height}
          rx={radius}
          ry={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth={1.5}
        />
        <rect
          x={12}
          y={12}
          width={width}
          height={height}
          rx={radius}
          ry={radius}
          fill="none"
          stroke={sweepColor}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${segLen} ${perim - segLen}`}
          strokeDashoffset={dashOffset}
          style={{ opacity: 0.45, filter: "blur(6px)" }}
        />
        <rect
          x={12}
          y={12}
          width={width}
          height={height}
          rx={radius}
          ry={radius}
          fill="none"
          stroke="#F8FAFC"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={`${segLen * 0.65} ${perim - segLen * 0.65}`}
          strokeDashoffset={dashOffset - segLen * 0.16}
        />
      </svg>

      {showReticles &&
        [
          [-16, -16],
          [width + 16, -16],
          [-16, height + 16],
          [width + 16, height + 16],
        ].map(([rx, ry], idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: rx - 7,
              top: ry - 7,
              width: 14,
              height: 14,
              color: "rgba(147, 197, 253, 0.78)",
              fontFamily: FONTS.sans,
              fontSize: 16,
              lineHeight: "14px",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            +
          </div>
        ))}
    </div>
  );
};

/**
 * 2. Frosted Glass Node Pill (zero purple: Cobalt, Dark Obsidian, Tactile Lime, or Studio White).
 */
export const GlassNodeCard: React.FC<{
  label: string;
  variant?: "cobalt" | "dark" | "lime" | "white";
  enterFrame: number;
  dotSide?: "left" | "right";
  style?: React.CSSProperties;
}> = ({ label, variant = "cobalt", enterFrame, dotSide = "right", style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({
    frame: frame - enterFrame,
    fps,
    config: { mass: 0.65, damping: 14, stiffness: 210 },
  });

  if (frame < enterFrame) return null;

  const themes = {
    cobalt: {
      bg: "linear-gradient(135deg, rgba(29, 99, 237, 0.88) 0%, rgba(14, 58, 168, 0.78) 100%)",
      border: "rgba(147, 197, 253, 0.55)",
      text: "#F8FAFC",
      dot: "#FFFFFF",
      glow: "0 16px 40px rgba(29, 99, 237, 0.45)",
    },
    dark: {
      bg: "linear-gradient(135deg, rgba(15, 23, 42, 0.86) 0%, rgba(7, 12, 24, 0.92) 100%)",
      border: "rgba(255, 255, 255, 0.22)",
      text: "#F1F5F9",
      dot: "#F8FAFC",
      glow: "0 16px 38px rgba(0, 0, 0, 0.55)",
    },
    lime: {
      bg: "linear-gradient(135deg, rgba(132, 204, 22, 0.95) 0%, rgba(77, 168, 24, 0.92) 100%)",
      border: "rgba(217, 249, 157, 0.78)",
      text: "#071305",
      dot: "#FFFFFF",
      glow: "0 18px 46px rgba(132, 204, 22, 0.48)",
    },
    white: {
      bg: "linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)",
      border: "#FFFFFF",
      text: "#0B1324",
      dot: "#1D63ED",
      glow: "0 18px 44px rgba(15, 23, 42, 0.22)",
    },
  };

  const th = themes[variant];

  const dotEl = (
    <span
      style={{
        width: 11,
        height: 11,
        borderRadius: "50%",
        backgroundColor: th.dot,
        boxShadow: `0 0 14px ${th.dot}`,
        flexShrink: 0,
      }}
    />
  );

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 18,
        padding: "16px 28px",
        borderRadius: 12,
        background: th.bg,
        border: `1.5px solid ${th.border}`,
        backdropFilter: "blur(16px)",
        boxShadow: th.glow,
        transform: `scale(${interpolate(p, [0, 1], [0.78, 1])}) translateY(${(1 - p) * 20}px)`,
        opacity: Math.min(1, p * 1.25),
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dotSide === "left" && dotEl}
      <span
        style={{
          fontFamily: FONTS.sans,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: "-0.02em",
          color: th.text,
        }}
      >
        {label}
      </span>
      {dotSide === "right" && dotEl}
    </div>
  );
};

/**
 * 3. Orthogonal Connected Node Tree.
 *
 * @deprecated v5: draws circuit-style orthogonal traces, which read as AI-default tech decoration.
 * Prefer library recipes (assets/recipes/recipes.json) or GlassNodeCard beside real UI with no connecting spines.
 * Kept only so older projects still render.
 */
export const OrthogonalNodeTree: React.FC<{
  nodes: Array<{
    label: string;
    variant?: "cobalt" | "dark" | "lime" | "white";
    enterFrame: number;
  }>;
  wireColor?: string;
}> = ({ nodes, wireColor = "#38BDF8" }) => {
  const rowPitch = 112;
  const totalH = Math.max(120, (nodes.length - 1) * rowPitch + 80);
  const midY = totalH / 2;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 34 }}>
      <svg
        width={110}
        height={totalH}
        style={{ position: "absolute", left: -90, top: 0, pointerEvents: "none" }}
      >
        <line x1={0} y1={midY} x2={46} y2={midY} stroke={wireColor} strokeWidth={3} />
        <line
          x1={46}
          y1={40}
          x2={46}
          y2={totalH - 40}
          stroke={wireColor}
          strokeWidth={3}
        />
        {nodes.map((_, i) => {
          const y = 40 + i * rowPitch;
          return <line key={i} x1={46} y1={y} x2={90} y2={y} stroke={wireColor} strokeWidth={3} />;
        })}
        <circle cx={46} cy={midY} r={6} fill="#FFFFFF" />
      </svg>
      {nodes.map((n, idx) => (
        <GlassNodeCard
          key={idx}
          label={n.label}
          variant={n.variant}
          enterFrame={n.enterFrame}
          dotSide="left"
        />
      ))}
    </div>
  );
};

/**
 * 4. Recursive "World-Inside-World" Portal Zoom Stage.
 * Starts zoomed in (`initialScale`) so an inner viewport fills 1920x1080 cleanly, then speed-ramp zooms out
 * with velocity-proportional Gaussian blur to reveal the surrounding NLE / monitor wall / hardware device!
 */
export const PortalZoomStage: React.FC<{
  zoomStartFrame: number;
  zoomDurationFrames?: number;
  initialScale: number;
  finalScale?: number;
  initialOffset?: [number, number];
  finalOffset?: [number, number];
  tilt3D?: [number, number]; // [rotateYDeg, rotateXDeg] after zoom
  tiltStartFrame?: number;
  children: React.ReactNode;
}> = ({
  zoomStartFrame,
  zoomDurationFrames = 16,
  initialScale,
  finalScale = 1.0,
  initialOffset = [0, 0],
  finalOffset = [0, 0],
  tilt3D = [0, 0],
  tiltStartFrame,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zP = interpolate(
    frame,
    [zoomStartFrame, zoomStartFrame + zoomDurationFrames],
    [0, 1],
    { easing: EASE_COMMERCIAL, extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const blurPx =
    frame >= zoomStartFrame && frame <= zoomStartFrame + zoomDurationFrames
      ? Math.sin(((frame - zoomStartFrame) / zoomDurationFrames) * Math.PI) * 7.0
      : 0;

  const tiltP =
    tiltStartFrame !== undefined
      ? spring({ frame: frame - tiltStartFrame, fps, config: { mass: 0.8, damping: 15, stiffness: 140 } })
      : zP;

  const sc = interpolate(zP, [0, 1], [initialScale, finalScale]);
  const ox = interpolate(zP, [0, 1], [initialOffset[0], finalOffset[0]]);
  const oy = interpolate(zP, [0, 1], [initialOffset[1], finalOffset[1]]);
  const ry = tilt3D[0] * tiltP;
  const rx = tilt3D[1] * tiltP;

  return (
    <AbsoluteFill
      style={{
        perspective: 1400,
        alignItems: "center",
        justifyContent: "center",
        filter: blurPx > 0.3 ? `blur(${blurPx.toFixed(1)}px)` : undefined,
      }}
    >
      <div
        style={{
          transform: `translate3d(${ox}px, ${oy}px, 0) scale(${sc}) rotateY(${ry}deg) rotateX(${rx}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/**
 * 5. Calibrated Split-Portrait Match-Cut Viewport.
 * Locks two contrasting worlds along a shared eye/nose-bridge anchor (`eyeAnchorPct`).
 */
export const SplitMatchViewport: React.FC<{
  leftImageSrc: string;
  rightImageSrc: string;
  lockFrame: number;
  width?: number;
  height?: number;
  leftScale?: number;
  eyeAnchorPct?: [number, number];
}> = ({
  leftImageSrc,
  rightImageSrc,
  lockFrame,
  width = 1480,
  height = 810,
  leftScale = 1.0,
  eyeAnchorPct = [50, 37],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lockSpring = spring({
    frame: frame - lockFrame,
    fps,
    config: { mass: 0.85, damping: 15, stiffness: 145 },
  });

  const misalignY = (1 - lockSpring) * 145;
  const splitPct = eyeAnchorPct[0] + (frame >= lockFrame + 16 ? Math.sin((frame - lockFrame) * 0.09) * 0.9 : 0);

  return (
    <GlowSweepFrame width={width} height={height} radius={28} showReticles>
      <AbsoluteFill style={{ transform: `translateY(${misalignY}px)` }}>
        <Img src={rightImageSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          clipPath: `inset(0 ${100 - splitPct}% 0 0)`,
          transform: `translateY(${-misalignY}px)`,
        }}
      >
        <Img
          src={leftImageSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${leftScale})`,
            transformOrigin: `${eyeAnchorPct[0]}% ${eyeAnchorPct[1]}%`,
          }}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: `${splitPct}%`,
          top: 0,
          bottom: 0,
          width: 4,
          marginLeft: -2,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 0 24px #38BDF8, 0 0 48px #1D63ED",
        }}
      />
    </GlowSweepFrame>
  );
};

/**
 * 6. Tactile Commercial Studio Cursor + Click Bounce & Ripple.
 */
export const StudioCursor: React.FC<{
  x: number;
  y: number;
  clickFrame?: number;
  scale?: number;
}> = ({ x, y, clickFrame, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let clickBounce = 1;
  let rippleP = 0;
  if (clickFrame !== undefined && frame >= clickFrame) {
    const cf = frame - clickFrame;
    const sp = spring({
      frame: cf,
      fps,
      config: { mass: 0.4, damping: 10, stiffness: 320 },
    });
    clickBounce = cf < 4 ? 0.82 : 0.82 + 0.18 * sp;
    rippleP = interpolate(cf, [0, 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 80,
        transform: `scale(${scale * clickBounce})`,
        transformOrigin: "4px 4px",
      }}
    >
      {rippleP > 0 && rippleP < 1 && (
        <div
          style={{
            position: "absolute",
            left: -34 * rippleP,
            top: -34 * rippleP,
            width: 68 * rippleP,
            height: 68 * rippleP,
            borderRadius: "50%",
            border: "3px solid #60A5FA",
            opacity: 1 - rippleP,
            boxShadow: "0 0 20px #38BDF8",
          }}
        />
      )}

      <svg
        width={46}
        height={52}
        viewBox="0 0 36 42"
        style={{ filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.55))" }}
      >
        <path
          d="M3 2 L32 19 L19 22.5 L25 36 L19.5 38.5 L13.5 25 L4.5 33 Z"
          fill="#0B1938"
          stroke="#FFFFFF"
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/**
 * 7. Out-of-Focus Foreground Studio Ring-Light Wipe.
 */
export const BokehRingWipe: React.FC<{
  triggerFrame: number;
  durationFrames?: number;
  direction?: "left-to-right" | "right-to-left";
}> = ({ triggerFrame, durationFrames = 14, direction = "left-to-right" }) => {
  const frame = useCurrentFrame();
  if (frame < triggerFrame || frame > triggerFrame + durationFrames) {
    return null;
  }

  const u = interpolate(
    frame,
    [triggerFrame, triggerFrame + durationFrames],
    [0, 1],
    { easing: EASE_IN_OUT_SNAP, extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const startX = direction === "left-to-right" ? -1650 : 2150;
  const endX = direction === "left-to-right" ? 2150 : -1650;
  const curX = startX + (endX - startX) * u;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 120, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: curX,
          top: -260,
          width: 1560,
          height: 1560,
          borderRadius: "50%",
          border: "165px solid rgba(248, 250, 252, 0.94)",
          boxShadow: "0 0 120px 45px rgba(96, 165, 250, 0.55)",
          filter: "blur(26px)",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * 8. Deep Cinema Sapphire / Daylight Cyclorama Backdrop (Zero Purple!).
 */
export const CobaltStudioBackdrop: React.FC<{ variant?: "dark" | "bright" }> = ({
  variant = "dark",
}) => {
  const frame = useCurrentFrame();
  const driftX = Math.sin(frame * 0.03) * 45;
  const driftY = Math.cos(frame * 0.025) * 30;

  if (variant === "bright") {
    return (
      <AbsoluteFill
        style={{
          background: "linear-gradient(135deg, #F8FAFC 0%, #E6EFFD 55%, #D5E5FC 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -250 + driftX,
            top: -180,
            width: 2400,
            height: 440,
            background:
              "linear-gradient(90deg, rgba(29,99,237,0.22) 0%, rgba(56,189,248,0.12) 60%, transparent 100%)",
            transform: "rotate(-16deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -300 - driftX,
            bottom: -140,
            width: 2200,
            height: 420,
            background:
              "linear-gradient(270deg, rgba(29,99,237,0.26) 0%, rgba(56,189,248,0.08) 70%, transparent 100%)",
            transform: "rotate(-16deg)",
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#040A18", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "12%",
          top: "-18%",
          width: 1100,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(29, 99, 237, 0.36) 0%, transparent 70%)",
          transform: `translate(${driftX}px, ${driftY}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "-8%",
          bottom: "-22%",
          width: 1050,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14, 116, 204, 0.28) 0%, transparent 70%)",
          transform: `translate(${-driftX}px, ${-driftY}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(148, 163, 184, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.055) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
        }}
      />
    </AbsoluteFill>
  );
};
