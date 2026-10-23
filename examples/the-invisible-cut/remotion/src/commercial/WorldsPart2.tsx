import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../fonts";
import {
  CobaltStudioBackdrop,
  EASE_COMMERCIAL,
  GlassNodeCard,
  GlowSweepFrame,
  StudioCursor,
} from "./CommercialPrimitives";

/**
 * WORLDS 5 & 6 (local frames 0..228 | global 15.04s - 24.16s):
 * Act A (0..108): 12 glaring equal-brightness cards shatter attention ("Flood the frame with equal brightness, and attention shatters").
 * Act B (108..228): StudioCursor pulls exposure slider to 10% -> 11 cards drop into 7% shadow, leaving ONE Hero GlowSweepFrame
 *                   connected to a 3-node Frosted Glass Tree ("Discipline 90% into shadow, and one hero commands the room")!
 */
export const World5And6ShadowHero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shatterP = spring({
    frame: frame - 54,
    fps,
    config: { mass: 0.7, damping: 13, stiffness: 180 },
  });

  const disciplineP = spring({
    frame: frame - 108,
    fps,
    config: { mass: 0.85, damping: 16, stiffness: 135 },
  });

  const photos = [
    "broll_set_1.jpg",
    "resolve_studio.jpg",
    "world_warm_portrait.jpg",
    "broll_set_2.jpg",
    "broll_fire_5.jpg", // idx 4 = HERO
    "macro_iris.jpg",
    "broll_silhouette_3.jpg",
    "world_cobalt_portrait.jpg",
    "editor_silhouette.jpg",
    "broll_set_1.jpg",
    "resolve_studio.jpg",
    "broll_set_2.jpg",
  ];

  // Cursor drags exposure fader down between f=102..126
  const cursorX = interpolate(frame, [98, 112, 134], [1560, 1250, 990], {
    easing: EASE_COMMERCIAL,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [98, 112, 134], [880, 935, 935], {
    easing: EASE_COMMERCIAL,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <CobaltStudioBackdrop variant="dark" />

      {/* Background 4x3 Grid of 12 Competing Cards -> Disciplined into 8% Shadow */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 390px)",
            gridTemplateRows: "repeat(3, 230px)",
            gap: 26,
            transform: `scale(${interpolate(disciplineP, [0, 1], [1.0, 0.96])})`,
          }}
        >
          {photos.map((src, idx) => {
            const col = idx % 4;
            const row = Math.floor(idx / 4);
            const dx = (col - 1.5) * 72 * shatterP * (1 - disciplineP);
            const dy = (row - 1.0) * 64 * shatterP * (1 - disciplineP);
            const rot = ((idx % 2 === 0 ? 1 : -1) * (4 + idx)) * shatterP * (1 - disciplineP);

            // Glaring overexposed brightness before f=108, then 8% deep shadow!
            const glare = interpolate(disciplineP, [0, 1], [1.55, 0.25]);
            const cardOpacity = interpolate(disciplineP, [0, 1], [1.0, 0.08]);

            return (
              <div
                key={idx}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  border:
                    disciplineP < 0.4
                      ? "3px solid rgba(255,255,255,0.92)"
                      : "1px solid rgba(148,163,184,0.12)",
                  boxShadow:
                    disciplineP < 0.4
                      ? "0 0 38px rgba(255,255,255,0.55)"
                      : "none",
                  opacity: cardOpacity,
                  filter: `brightness(${glare}) blur(${disciplineP * 5}px)`,
                  transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
                }}
              >
                <Img
                  src={staticFile(`assets/photos/${src}`)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* ACT A Callout: Equal Brightness -> Attention Shatters */}
      {frame < 112 && (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            opacity: interpolate(frame, [98, 110], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              padding: "22px 44px",
              borderRadius: 20,
              backgroundColor: "rgba(4, 10, 24, 0.88)",
              border: "2px solid rgba(255,255,255,0.85)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.75)",
              transform: `scale(${interpolate(shatterP, [0, 1], [0.95, 1.08])}) rotate(${shatterP * -2.5}deg)`,
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 20, color: "#93C5FD", marginBottom: 4 }}>
              100% EQUAL BRIGHTNESS
            </div>
            <div style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 56, color: "#FFFFFF" }}>
              {frame < 52 ? "Flood the Frame" : "Attention Shatters"}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ACT B (f=106..228): ONE HERO GLOW-SWEEP FRAME + CONNECTED 3-NODE FROSTED TREE (push.mp4 t=47s!) */}
      {frame >= 106 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 90,
              transform: `scale(${interpolate(disciplineP, [0, 1], [0.78, 1.0])})`,
              opacity: disciplineP,
            }}
          >
            {/* Left-Center Hero Cinema Frame */}
            <GlowSweepFrame width={820} height={520} radius={26} showReticles>
              <Img
                src={staticFile("assets/photos/broll_fire_5.jpg")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${interpolate(frame, [108, 228], [1.0, 1.12])})`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 26,
                  bottom: 24,
                  padding: "8px 18px",
                  borderRadius: 10,
                  backgroundColor: "rgba(4,10,24,0.82)",
                  border: "1px solid rgba(147,197,253,0.45)",
                  fontFamily: FONTS.sans,
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#F8FAFC",
                }}
              >
                HERO FOCAL SUBJECT  •  100% LUMA
              </div>
            </GlowSweepFrame>

            {/* Right Connected 3-Tier Frosted Node Graph */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 34 }}>
              {/* Orthogonal SVG Connector Spine */}
              <svg
                width={120}
                height={340}
                style={{ position: "absolute", left: -90, top: 10, pointerEvents: "none" }}
              >
                <path
                  d="M 0 165 L 48 165 M 48 40 L 48 290 M 48 40 L 90 40 M 48 165 L 90 165 M 48 290 L 90 290"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth={3}
                />
                <circle cx={48} cy={165} r={6} fill="#FFFFFF" />
              </svg>

              <GlassNodeCard
                label="90% Disciplined to Shadow"
                variant="cobalt"
                enterFrame={116}
                dotSide="left"
              />
              <GlassNodeCard
                label="Zero Competing Glare"
                variant="dark"
                enterFrame={136}
                dotSide="left"
              />
              <GlassNodeCard
                label="One Hero Commands"
                variant="lime"
                enterFrame={158}
                dotSide="left"
              />
            </div>
          </div>

          {/* Bottom Interactive Shadow Fader Bar + StudioCursor */}
          <div
            style={{
              position: "absolute",
              bottom: 64,
              width: 680,
              height: 58,
              borderRadius: 999,
              backgroundColor: "rgba(10, 18, 36, 0.9)",
              border: "1px solid rgba(96, 165, 250, 0.4)",
              display: "flex",
              alignItems: "center",
              padding: "0 26px",
              gap: 20,
            }}
          >
            <span style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 16, color: "#93C5FD" }}>
              BACKGROUND LUMA
            </span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: "#1E293B", position: "relative" }}>
              <div
                style={{
                  width: `${interpolate(disciplineP, [0, 1], [100, 10])}%`,
                  height: "100%",
                  borderRadius: 4,
                  backgroundColor: "#38BDF8",
                }}
              />
            </div>
            <span style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 18, color: "#84CC16", width: 54 }}>
              {Math.round(interpolate(disciplineP, [0, 1], [100, 10]))}%
            </span>
          </div>

          {frame <= 145 && <StudioCursor x={cursorX} y={cursorY} clickFrame={112} />}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/**
 * WORLD 7 (local frames 0..66 | global 24.00s - 26.64s):
 * "Accelerate the cut to build tension"
 * Live Cinema Monitor hard-cutting faster & faster while playhead rips across exponentially shrinking NLE clips!
 */
export const World7AcceleratingTimeline: React.FC = () => {
  const frame = useCurrentFrame();

  // Exponentially accelerating cut points across 66 frames: 0, 20, 36, 48, 56, 61
  const cutIndex =
    frame < 20 ? 0 : frame < 36 ? 1 : frame < 48 ? 2 : frame < 56 ? 3 : frame < 61 ? 4 : 5;

  const cutPhotos = [
    "resolve_studio.jpg",
    "broll_set_1.jpg",
    "broll_set_2.jpg",
    "broll_silhouette_3.jpg",
    "broll_fire_5.jpg",
    "macro_iris.jpg",
  ];

  const tNorm = Math.min(1, frame / 64);
  const playheadPct = Math.pow(tNorm, 1.85) * 92 + 4;

  const clipWidths = [330, 230, 155, 100, 62, 38];

  return (
    <AbsoluteFill style={{ perspective: 1300 }}>
      <CobaltStudioBackdrop variant="dark" />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          transform: `scale(${interpolate(frame, [0, 66], [0.96, 1.08])}) rotateX(6deg)`,
        }}
      >
        {/* Top Live Rapid-Cut Cinema Monitor */}
        <GlowSweepFrame width={1160} height={540} radius={24} showReticles>
          <Img
            src={staticFile(`assets/photos/${cutPhotos[cutIndex]}`)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", left: 28, top: 26 }}>
            <GlassNodeCard label="Accelerate the Cut" variant="cobalt" enterFrame={2} />
          </div>
          <div style={{ position: "absolute", right: 28, bottom: 26 }}>
            <GlassNodeCard label={`CUT 0${cutIndex + 1}  •  BUILD TENSION`} variant="lime" enterFrame={10} dotSide="left" />
          </div>
        </GlowSweepFrame>

        {/* Bottom Shrinking-Clip Rhythm Timeline */}
        <div
          style={{
            width: 1320,
            height: 170,
            borderRadius: 20,
            backgroundColor: "rgba(9, 16, 32, 0.92)",
            border: "1.5px solid rgba(96, 165, 250, 0.4)",
            boxShadow: "0 28px 60px rgba(0,0,0,0.65)",
            padding: "26px 34px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ripping Sky-Blue Playhead */}
          <div
            style={{
              position: "absolute",
              left: `${playheadPct}%`,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: "#FFFFFF",
              boxShadow: "0 0 24px #38BDF8, 0 0 48px #1D63ED",
              zIndex: 10,
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 12, height: "100%" }}>
            {clipWidths.map((w, idx) => {
              const passed = idx <= cutIndex;
              return (
                <div
                  key={idx}
                  style={{
                    width: w,
                    height: 92,
                    borderRadius: 12,
                    background: passed
                      ? "linear-gradient(135deg, #1D63ED 0%, #38BDF8 100%)"
                      : "rgba(30, 41, 59, 0.75)",
                    border: passed
                      ? "2px solid #FFFFFF"
                      : "1px solid rgba(148,163,184,0.25)",
                    boxShadow: passed ? "0 0 28px rgba(56,189,248,0.45)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONTS.sans,
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#FFFFFF",
                  }}
                >
                  {Math.round((w / 330) * 24)}f
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * WORLD 8 (local frames 0..104 | global 26.48s - 30.64s):
 * "then drop into dead silence right before the truth lands."
 * At local frame 88 (exact global frame 750 = 30.00s!), StudioCursor clicks [M] MUTE ->
 * ALL 64 stereo bars snap to a 1px horizon line in total -infinity dB blackout!
 */
export const World8WaveformSilenceDrop: React.FC = () => {
  const frame = useCurrentFrame();

  // Exact acoustic vacuum trigger: global frame 750 = local frame 88 (since sequence starts at f=662)
  const isMuted = frame >= 88;
  const collapse = interpolate(frame, [86, 89], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cursorX = interpolate(frame, [52, 84], [1620, 1485], {
    easing: EASE_COMMERCIAL,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [52, 84], [860, 244], {
    easing: EASE_COMMERCIAL,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#02050B", alignItems: "center", justifyContent: "center" }}>
      {!isMuted && <CobaltStudioBackdrop variant="dark" />}

      {!isMuted ? (
        <GlowSweepFrame width={1420} height={680} radius={26} bg="#070E1E" showReticles>
          {/* Console Top Header + [M] Mute Button */}
          <div
            style={{
              height: 88,
              padding: "0 40px",
              borderBottom: "1px solid rgba(148,163,184,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 15, color: "#60A5FA" }}>
                MASTER BUS  •  24-BIT / 48KHZ
              </div>
              <div style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 30, color: "#F8FAFC" }}>
                Drop Into Dead Silence
              </div>
            </div>

            {/* Interactive [M] MUTE Button Targeted by StudioCursor */}
            <div
              style={{
                padding: "12px 26px",
                borderRadius: 12,
                backgroundColor: frame >= 84 ? "#EF4444" : "rgba(239, 68, 68, 0.16)",
                border: "2px solid #EF4444",
                fontFamily: FONTS.sans,
                fontWeight: 700,
                fontSize: 20,
                color: "#FFFFFF",
                boxShadow: frame >= 84 ? "0 0 30px rgba(239,68,68,0.75)" : "none",
              }}
            >
              [M] MUTE MASTER
            </div>
          </div>

          {/* 64 Live Stereo Spectrum Bars */}
          <div
            style={{
              height: 592,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "0 48px",
            }}
          >
            {Array.from({ length: 64 }).map((_, i) => {
              const env = Math.sin((i / 63) * Math.PI);
              const wave =
                Math.abs(Math.sin(frame * 0.34 + i * 0.45)) * 0.65 +
                Math.abs(Math.cos(frame * 0.21 - i * 0.3)) * 0.35;
              const h = Math.max(3, (30 + 390 * env * wave) * collapse);
              return (
                <div
                  key={i}
                  style={{
                    width: 11,
                    height: h,
                    borderRadius: 6,
                    background:
                      h > 280
                        ? "linear-gradient(180deg, #F59E0B 0%, #38BDF8 45%, #1D63ED 100%)"
                        : "linear-gradient(180deg, #60A5FA 0%, #1D63ED 100%)",
                    boxShadow: "0 0 14px rgba(56,189,248,0.35)",
                  }}
                />
              );
            })}
          </div>
        </GlowSweepFrame>
      ) : (
        /* TOTAL ACOUSTIC & VISUAL VACUUM (global f=750..765 | 30.00s - 30.60s) */
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#010308" }}>
          <div
            style={{
              width: 1360,
              height: 1.5,
              backgroundColor: "rgba(148, 163, 184, 0.45)",
            }}
          />
          <div
            style={{
              marginTop: 22,
              fontFamily: FONTS.sans,
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: 3,
              color: "#475569",
            }}
          >
            -∞ dB  •  DEAD SILENCE
          </div>
        </AbsoluteFill>
      )}

      {!isMuted && frame >= 50 && <StudioCursor x={cursorX} y={cursorY} clickFrame={86} />}
    </AbsoluteFill>
  );
};

/**
 * WORLD 9 (local frames 0..147 | global 30.64s - 36.52s):
 * BRIGHT WHITE & COBALT COMMERCIAL STUDIO FINALE! (push.mp4 t=12s, t=28s, t=82s homage!)
 * "Zero timelines. Pure code. Cinema by design."
 * Authentic React + TypeScript + FFmpeg + GitHub SVGs -> Interactive Render Command Pill -> 3D Studio Display Hardware Lockup!
 */
export const World9CodeCinemaFinale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterPop = spring({
    frame,
    fps,
    config: { mass: 0.75, damping: 14, stiffness: 170 },
  });

  // At local f=68 (global 33.36s, "Cinema by design"), zoom-reveal the full 3D Studio Display + Editorial Lockup!
  const finaleReveal = spring({
    frame: frame - 68,
    fps,
    config: { mass: 0.9, damping: 16, stiffness: 135 },
  });

  const cmdText = "npx remotion render cinema.mp4";
  const typedChars = Math.min(
    cmdText.length,
    Math.max(0, Math.floor((frame - 28) * 1.15))
  );

  const cursorX = interpolate(frame, [38, 60], [1480, 1255], {
    easing: EASE_COMMERCIAL,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [38, 60], [880, 615], {
    easing: EASE_COMMERCIAL,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stackLogos = [
    { icon: "react.svg", name: "React 19", bg: "#0B1938" },
    { icon: "typescript.svg", name: "TypeScript", bg: "#FFFFFF" },
    { icon: "ffmpeg.svg", name: "FFmpeg", bg: "#0B1938" },
    { icon: "github.svg", name: "Git Pipelines", bg: "#0B1938" },
  ];

  return (
    <AbsoluteFill style={{ perspective: 1500 }}>
      {/* Crisp Studio Daylight Cyclorama Contrast! */}
      <CobaltStudioBackdrop variant="bright" />

      {/* ACT 1 (f=0..72): Zero Timelines + Authentic Stack Icons + Interactive Command Bar */}
      {frame < 76 && (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            opacity: interpolate(frame, [66, 74], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `scale(${interpolate(enterPop, [0, 1], [0.88, 1.0])})`,
          }}
        >
          {/* Floating Authentic Tech Stack Tiles */}
          <div style={{ display: "flex", gap: 26, marginBottom: 38 }}>
            {stackLogos.map((item, idx) => {
              const tilePop = spring({
                frame: frame - idx * 4,
                fps,
                config: { damping: 13, stiffness: 190 },
              });
              return (
                <div
                  key={item.name}
                  style={{
                    padding: "16px 26px",
                    borderRadius: 20,
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid rgba(29, 99, 237, 0.22)",
                    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.09)",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    transform: `scale(${tilePop}) translateY(${Math.sin((frame + idx * 10) * 0.1) * 5}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: item.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Img src={staticFile(`assets/icons/${item.icon}`)} style={{ width: 26, height: 26 }} />
                  </div>
                  <span style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 21, color: "#0F172A" }}>
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Crisp Editorial Headline */}
          <div
            style={{
              fontFamily: FONTS.sans,
              fontWeight: 700,
              fontSize: 88,
              letterSpacing: -2.5,
              color: "#0A1224",
              marginBottom: 34,
            }}
          >
            {frame < 30 ? "Zero Timelines." : "Pure Code."}
          </div>

          {/* push.mp4 (t=28s) Interactive Command Pill + Render Button */}
          <div
            style={{
              width: 880,
              height: 86,
              borderRadius: 999,
              backgroundColor: "#0A1428",
              border: "2px solid #1D63ED",
              boxShadow: "0 26px 60px rgba(29, 99, 237, 0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px 0 36px",
            }}
          >
            <div style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 26, color: "#E2E8F0" }}>
              <span style={{ color: "#38BDF8", marginRight: 14 }}>$</span>
              {cmdText.slice(0, typedChars)}
            </div>
            <div
              style={{
                padding: "16px 34px",
                borderRadius: 999,
                background:
                  frame >= 60
                    ? "linear-gradient(135deg, #84CC16 0%, #4D7C0F 100%)"
                    : "linear-gradient(135deg, #1D63ED 0%, #38BDF8 100%)",
                fontFamily: FONTS.sans,
                fontWeight: 700,
                fontSize: 22,
                color: "#FFFFFF",
              }}
            >
              Render 4K
            </div>
          </div>

          {frame >= 36 && <StudioCursor x={cursorX} y={cursorY} clickFrame={60} />}
        </AbsoluteFill>
      )}

      {/* ACT 2 (f=68..147): 3D Hardware Studio Display + "Cinema [by design.]" Lockup (push.mp4 t=12s & t=82s!) */}
      {frame >= 68 && (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            opacity: finaleReveal,
            transform: `scale(${interpolate(finaleReveal, [0, 1], [0.84, 1.0])})`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 74 }}>
            {/* 3D Angled Studio Hardware Display */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: `rotateY(12deg) rotateX(3deg) translateY(${Math.sin(frame * 0.08) * 6}px)`,
              }}
            >
              {/* Bezel & Cinema Screen */}
              <div
                style={{
                  width: 780,
                  height: 465,
                  borderRadius: "24px 24px 0 0",
                  backgroundColor: "#0B101B",
                  padding: "18px 18px 0 18px",
                  boxShadow: "0 38px 90px rgba(15, 23, 42, 0.28)",
                  border: "2px solid #CBD5E1",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Img
                  src={staticFile("assets/photos/resolve_studio.jpg")}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px 12px 0 0" }}
                />
                <div style={{ position: "absolute", left: 36, bottom: 26 }}>
                  <GlassNodeCard label="25fps Master  •  -14 LUFS" variant="cobalt" enterFrame={74} />
                </div>
              </div>

              {/* Silver Aluminum Chin with Authentic Apple Icon */}
              <div
                style={{
                  width: 780,
                  height: 54,
                  borderRadius: "0 0 24px 24px",
                  background: "linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #94A3B8",
                }}
              >
                <Img
                  src={staticFile("assets/icons/apple.svg")}
                  style={{ width: 22, height: 22, filter: "invert(0.8)" }}
                />
              </div>

              {/* Sculpted Aluminum Stand */}
              <div
                style={{
                  width: 130,
                  height: 76,
                  background: "linear-gradient(90deg, #94A3B8 0%, #F1F5F9 50%, #94A3B8 100%)",
                  clipPath: "polygon(16% 0%, 84% 0%, 100% 100%, 0% 100%)",
                }}
              />
              <div
                style={{
                  width: 240,
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: "#94A3B8",
                  boxShadow: "0 12px 24px rgba(15,23,42,0.22)",
                }}
              />
            </div>

            {/* Right Clean Commercial Lockup ("Cinema [by design.]" — push.mp4 t=82s style!) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }}>
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: 3,
                  color: "#1D63ED",
                }}
              >
                CINEMA CODE STUDIO
              </div>

              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontWeight: 700,
                  fontSize: 104,
                  lineHeight: 0.98,
                  letterSpacing: -3,
                  color: "#0A1224",
                }}
              >
                Cinema
              </div>

              <div
                style={{
                  padding: "14px 38px",
                  borderRadius: 24,
                  background: "linear-gradient(135deg, #1D63ED 0%, #0E3AA8 100%)",
                  boxShadow: "0 22px 50px rgba(29, 99, 237, 0.35)",
                  fontFamily: FONTS.serifItalic,
                  fontSize: 86,
                  lineHeight: 1.0,
                  color: "#FFFFFF",
                }}
              >
                by design.
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
