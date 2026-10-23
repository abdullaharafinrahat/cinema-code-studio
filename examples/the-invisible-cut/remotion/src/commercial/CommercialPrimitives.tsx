import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../fonts";

export const EASE_COMMERCIAL = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT_SNAP = Easing.bezier(0.76, 0, 0.24, 1);

/**
 * Animated Corner Light-Sweep Viewport (push.mp4 signature t=21s, 36s, 46.5s, 84s).
 * Traces a glowing ice-white & cobalt laser highlight around rounded corners with soft optical bloom.
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
      {/* Inner clipped content */}
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

      {/* Subtle static glass border + animated glowing perimeter sweep */}
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
        {/* Outer soft optical bloom of the light sweep */}
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
        {/* Crisp white-hot core of the corner light sweep */}
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

      {/* Architectural '+' corner reticles (push.mp4 t=93s, 132s) */}
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
 * Frosted Glass Node Pill (push.mp4 signature t=30s, 39.5s-41.6s).
 * Zero purple: Cobalt ('cobalt'), Dark Obsidian ('dark'), or Electric Lime ('lime').
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
 * Motion-Blurred Commercial Studio Cursor + Click Ripple (push.mp4 t=44.4s, 87s, 90s).
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
      {/* Click Ripple Ring */}
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

      {/* Sleek Commercial Vector Pointer */}
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
 * Out-of-Focus Foreground Studio Ring-Light Wipe (push.mp4 t=38.1s, 63s, 75s).
 * Sweeps right across the lens to hide cuts in physical optical bokeh!
 */
export const BokehRingWipe: React.FC<{
  triggerFrame: number;
  durationFrames?: number;
  direction?: "left-to-right" | "right-to-left";
}> = ({ triggerFrame, durationFrames = 15, direction = "left-to-right" }) => {
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
 * Deep Cinema Sapphire / Cobalt Studio Backdrop (push.mp4 commercial atmosphere — zero purple!).
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
        {/* Diagonal crisp cobalt studio light shafts (push.mp4 t=46.5s & t=126s) */}
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
    <AbsoluteFill
      style={{
        backgroundColor: "#040A18",
        overflow: "hidden",
      }}
    >
      {/* Ambient volumetric sapphire studio pools */}
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
      {/* Subtle architectural blueprint grid */}
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
