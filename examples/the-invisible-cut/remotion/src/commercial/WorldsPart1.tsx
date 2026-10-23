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
 * WORLD 1 (local frames 0..114 | global 0.00s - 4.56s):
 * Starts INSIDE the stark B&W commercial studio silhouette ("You never notice a great cut"),
 * then RECURSIVELY WHIP-ZOOMS OUT to reveal it lives inside a full NLE Video Editor Monitor,
 * then tilts in 3D as authentic DaVinci/Pr/Ae icons & StudioCursor strike out "isn't software"!
 */
export const World1EditorToNle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Recursive zoom-out at f=42..58: scale 2.38 (filling 1920x1080 with the NLE preview window!) -> 1.0
  const zoomOutP = interpolate(frame, [42, 58], [0, 1], {
    easing: EASE_COMMERCIAL,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Velocity blur during rapid whip zoom-out
  const zoomBlur =
    frame >= 42 && frame <= 57
      ? Math.sin(((frame - 42) / 15) * Math.PI) * 7.5
      : 0;

  // At f=66..84, tilt the NLE monitor in 3D space to introduce floating software icons
  const tiltP = spring({
    frame: frame - 66,
    fps,
    config: { mass: 0.8, damping: 15, stiffness: 140 },
  });

  const monitorScale = interpolate(zoomOutP, [0, 1], [2.24, 0.94]);
  const monitorOffsetY = interpolate(zoomOutP, [0, 1], [293, -16]);
  const baseOffsetX = interpolate(zoomOutP, [0, 1], [-34, 0]);
  const rotY = interpolate(tiltP, [0, 1], [0, -13]);
  const rotX = interpolate(tiltP, [0, 1], [0, 6]);
  const shiftX = baseOffsetX + interpolate(tiltP, [0, 1], [0, -130]);

  const cutFlash = spring({
    frame: frame - 29,
    fps,
    config: { mass: 0.5, damping: 12, stiffness: 260 },
  });

  const strikeP = spring({
    frame: frame - 84,
    fps,
    config: { mass: 0.55, damping: 14, stiffness: 240 },
  });

  // Cursor glides in at f=68 to click "Software" at f=83
  const cursorX = interpolate(frame, [66, 82, 108], [1720, 1375, 1430], {
    easing: EASE_COMMERCIAL,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [66, 82, 108], [860, 525, 560], {
    easing: EASE_COMMERCIAL,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ perspective: 1400 }}>
      <CobaltStudioBackdrop variant="dark" />

      {/* 3D Perspective Stage holding the Full NLE Studio Monitor */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transformStyle: "preserve-3d",
          filter: zoomBlur > 0.3 ? `blur(${zoomBlur.toFixed(1)}px)` : undefined,
        }}
      >
        <div
          style={{
            transform: `translate3d(${shiftX}px, ${monitorOffsetY}px, 0) scale(${monitorScale}) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <GlowSweepFrame width={1440} height={850} radius={22} bg="#0A101E" showReticles={zoomOutP > 0.6}>
            {/* Top NLE Window Chrome */}
            <div
              style={{
                height: 44,
                backgroundColor: "#0F172A",
                borderBottom: "1px solid rgba(148,163,184,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
              }}
            >
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#EF4444" }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#F59E0B" }} />
                <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#22C55E" }} />
                <span
                  style={{
                    marginLeft: 14,
                    fontFamily: FONTS.sans,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#94A3B8",
                  }}
                >
                  Studio Cut Pro  —  The_Invisible_Cut.prproj
                </span>
              </div>
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#38BDF8",
                  padding: "4px 12px",
                  borderRadius: 6,
                  backgroundColor: "rgba(56,189,248,0.14)",
                }}
              >
                00:00:0{Math.floor(frame / 25)}:{String(frame % 25).padStart(2, "0")}
              </div>
            </div>

            {/* Middle Workspace: Left Media/Scopes + Center Program Preview + Right Inspector */}
            <div style={{ display: "flex", height: 500, borderBottom: "1px solid rgba(148,163,184,0.16)" }}>
              {/* Left Scopes & Bins */}
              <div
                style={{
                  width: 240,
                  backgroundColor: "#0B1222",
                  borderRight: "1px solid rgba(148,163,184,0.14)",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 700, color: "#64748B" }}>
                  MEDIA POOL
                </div>
                {["broll_set_1.jpg", "broll_fire_5.jpg", "resolve_studio.jpg"].map((img, idx) => (
                  <div
                    key={img}
                    style={{
                      height: 82,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: idx === 0 ? "2px solid #38BDF8" : "1px solid rgba(255,255,255,0.1)",
                      position: "relative",
                    }}
                  >
                    <Img
                      src={staticFile(`assets/photos/${img}`)}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>

              {/* CENTER PROGRAM MONITOR — Holds the Initial Fullscreen Silhouette Scene! */}
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  backgroundColor: "#FFFFFF",
                  overflow: "hidden",
                }}
              >
                <Img
                  src={staticFile("assets/photos/editor_silhouette.jpg")}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${interpolate(frame, [0, 44], [1.02, 1.1])})`,
                  }}
                />

                {/* Skewed Floating Words Behind/Around Editor Silhouette (push.mp4 t=3.2s homage!) */}
                <div
                  style={{
                    position: "absolute",
                    left: "8%",
                    top: "23%",
                    transform: `rotate(-7deg) scale(${spring({
                      frame: frame - 3,
                      fps,
                      config: { damping: 13, stiffness: 200 },
                    })})`,
                    fontFamily: FONTS.sans,
                    fontWeight: 700,
                    fontSize: 34,
                    color: "#0F172A",
                    backgroundColor: "rgba(226, 238, 255, 0.94)",
                    padding: "6px 16px",
                    borderRadius: 10,
                    boxShadow: "0 10px 26px rgba(15,23,42,0.16)",
                  }}
                >
                  You never notice
                </div>

                {/* Razor Splice Beam & "a great cut." at f=28 */}
                {frame >= 27 && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: "#1D63ED",
                        boxShadow: "0 0 24px #38BDF8",
                        transform: `scaleY(${cutFlash}) rotate(9deg)`,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "8%",
                        top: "25%",
                        transform: `rotate(5deg) scale(${cutFlash})`,
                        padding: "7px 20px",
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #1D63ED 0%, #0B2559 100%)",
                        color: "#FFFFFF",
                        fontFamily: FONTS.serifItalic,
                        fontSize: 44,
                        boxShadow: "0 14px 34px rgba(29,99,237,0.45)",
                      }}
                    >
                      a great cut.
                    </div>
                  </>
                )}
              </div>

              {/* Right Lumetri / Inspector Panel */}
              <div
                style={{
                  width: 210,
                  backgroundColor: "#0B1222",
                  borderLeft: "1px solid rgba(148,163,184,0.14)",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 700, color: "#64748B" }}>
                  COLOR &amp; OPTICS
                </div>
                {[0, 1].map((w) => (
                  <div
                    key={w}
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: "50%",
                      alignSelf: "center",
                      border: "2px solid rgba(56,189,248,0.35)",
                      background:
                        "radial-gradient(circle, rgba(29,99,237,0.35) 0%, rgba(15,23,42,0.95) 75%)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Multi-Track Timeline (push.mp4 t=3.9s & t=15s!) */}
            <div style={{ height: 306, backgroundColor: "#080E1C", padding: "18px 24px", position: "relative" }}>
              {/* Playhead sweeping across timeline */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${22 + (frame / 114) * 58}%`,
                  width: 2.5,
                  backgroundColor: "#38BDF8",
                  boxShadow: "0 0 14px #38BDF8",
                  zIndex: 10,
                }}
              />
              {[
                { label: "V3", color: "#38BDF8", clips: [[12, 24], [42, 30], [76, 16]] },
                { label: "V2", color: "#1D63ED", clips: [[4, 34], [40, 26], [68, 26]] },
                { label: "V1", color: "#0EA5E9", clips: [[0, 38], [39, 55]] },
                { label: "A1", color: "#22C55E", clips: [[0, 94]] },
              ].map((tr) => (
                <div
                  key={tr.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 52,
                    marginBottom: 10,
                    gap: 14,
                  }}
                >
                  <span style={{ width: 32, fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, color: "#64748B" }}>
                    {tr.label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 40,
                      backgroundColor: "rgba(255,255,255,0.03)",
                      borderRadius: 6,
                      position: "relative",
                    }}
                  >
                    {tr.clips.map(([st, wid], ci) => (
                      <div
                        key={ci}
                        style={{
                          position: "absolute",
                          left: `${st}%`,
                          width: `${wid}%`,
                          top: 4,
                          bottom: 4,
                          borderRadius: 6,
                          backgroundColor: tr.color,
                          opacity: 0.82,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlowSweepFrame>
        </div>
      </AbsoluteFill>

      {/* Floating 3D Authentic NLE App Badges & "Not Just Software" Strikeout (f=66..114) */}
      {frame >= 64 && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {/* Authentic DaVinci Resolve Icon Card */}
          <div
            style={{
              position: "absolute",
              right: 210,
              top: 175,
              padding: "18px 24px",
              borderRadius: 20,
              background: "rgba(15, 23, 42, 0.88)",
              border: "1.5px solid rgba(96, 165, 250, 0.45)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 24px 50px rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              gap: 16,
              transform: `scale(${tiltP}) rotate(5deg)`,
            }}
          >
            <Img src={staticFile("assets/icons/davinci.svg")} style={{ width: 46, height: 46 }} />
            <span style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 24, color: "#F8FAFC" }}>
              DaVinci
            </span>
          </div>

          {/* Sleek Pr & Ae Cobalt Studio Tiles (Zero Purple!) */}
          <div
            style={{
              position: "absolute",
              right: 115,
              top: 310,
              display: "flex",
              gap: 18,
              transform: `scale(${tiltP}) rotate(-4deg)`,
            }}
          >
            {[
              { code: "Pr", name: "Timeline", col: "#38BDF8" },
              { code: "Ae", name: "Keyframes", col: "#60A5FA" },
            ].map((b) => (
              <div
                key={b.code}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 22,
                  background: "linear-gradient(145deg, #0D2149 0%, #071126 100%)",
                  border: `2px solid ${b.col}`,
                  boxShadow: "0 20px 44px rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONTS.sans,
                  fontWeight: 700,
                  fontSize: 40,
                  color: b.col,
                }}
              >
                {b.code}
              </div>
            ))}
          </div>

          {/* Interactive Pill Clicked by StudioCursor -> "Great Editing ≠ Software" */}
          <div
            style={{
              position: "absolute",
              right: 120,
              top: 465,
              padding: "22px 36px",
              borderRadius: 16,
              background:
                strikeP > 0.2
                  ? "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.92) 100%)"
                  : "linear-gradient(135deg, #1D63ED 0%, #0E3AA8 100%)",
              border: "1.5px solid rgba(147,197,253,0.6)",
              boxShadow: "0 24px 60px rgba(2,8,23,0.7)",
              transform: `scale(${tiltP})`,
            }}
          >
            <div style={{ fontFamily: FONTS.sans, fontSize: 18, fontWeight: 700, color: "#93C5FD", marginBottom: 4 }}>
              GREAT EDITING
            </div>
            <div style={{ position: "relative", display: "inline-block" }}>
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontWeight: 700,
                  fontSize: 48,
                  color: strikeP > 0.2 ? "#64748B" : "#FFFFFF",
                }}
              >
                Isn’t Software
              </span>
              <span
                style={{
                  position: "absolute",
                  left: -8,
                  top: "52%",
                  height: 6,
                  width: `${strikeP * 106}%`,
                  backgroundColor: "#EF4444",
                  borderRadius: 4,
                  boxShadow: "0 0 16px #EF4444",
                  transform: "rotate(-4deg)",
                }}
              />
            </div>
          </div>

          <StudioCursor x={cursorX} y={cursorY} clickFrame={83} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/**
 * WORLD 2 (local frames 0..78 | global 4.48s - 7.60s):
 * Exact push.mp4 (t=51s) Commercial Anatomy Composition!
 * Glowing Studio Ring-Light + Verified X-Ray Skull & Cobalt Brain + Macro Human Iris Inset + Connected Callout Wires!
 */
export const World2PerceptionXray: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterScale = spring({
    frame,
    fps,
    config: { mass: 0.8, damping: 15, stiffness: 155 },
  });

  // Speed-ramp push toward glowing visual cortex on "of human perception" (local frame 34+)
  const pushCortex = interpolate(frame, [34, 76], [1.0, 1.24], {
    easing: EASE_COMMERCIAL,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const msVal = Math.round(
    interpolate(frame, [4, 24], [220, 60], {
      easing: EASE_COMMERCIAL,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill>
      <CobaltStudioBackdrop variant="dark" />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${interpolate(enterScale, [0, 1], [0.88, 1])})`,
        }}
      >
        {/* Glowing White & Cobalt Circular Studio Ring-Light (push.mp4 t=51s exact homage!) */}
        <div
          style={{
            position: "relative",
            width: 720,
            height: 720,
            borderRadius: "50%",
            border: "24px solid #F1F5F9",
            boxShadow:
              "0 0 90px rgba(56, 189, 248, 0.55), inset 0 0 80px rgba(29, 99, 237, 0.55)",
            background: "radial-gradient(circle, #0D2B6B 0%, #040B1A 72%)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${pushCortex})`,
          }}
        >
          {/* Verified Clean X-Ray Head & Cobalt Brain blended via Screen mode! */}
          <Img
            src={staticFile("assets/photos/xray_head_clean.jpg")}
            style={{
              width: "126%",
              height: "126%",
              objectFit: "cover",
              mixBlendMode: "screen",
            }}
          />
        </div>

        {/* SVG Orthogonal Glowing Callout Wires pointing to Eye Socket & Brain Cortex */}
        <svg
          width={1920}
          height={1080}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {/* Left wire from Left Eye Socket (875, 520) -> Left Macro Iris Card */}
          <polyline
            points="875,520 640,520 570,425 460,425"
            fill="none"
            stroke="#60A5FA"
            strokeWidth={3}
          />
          <circle cx={875} cy={520} r={7} fill="#FFFFFF" />

          {/* Right wire from Brain Cortex (1020, 365) -> Right Perception Node */}
          {frame >= 32 && (
            <>
              <polyline
                points="1020,365 1235,365 1295,310 1355,310"
                fill="none"
                stroke="#84CC16"
                strokeWidth={3}
              />
              <circle cx={1020} cy={365} r={8} fill="#84CC16" />
            </>
          )}
        </svg>

        {/* LEFT: Verified Real Macro Iris Photo + "60 ms" Counter Card */}
        <div
          style={{
            position: "absolute",
            left: 84,
            top: 295,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <GlowSweepFrame width={355} height={218} radius={20}>
            <Img
              src={staticFile("assets/photos/macro_iris.jpg")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 14,
                padding: "4px 12px",
                borderRadius: 8,
                backgroundColor: "rgba(4, 10, 24, 0.82)",
                fontFamily: FONTS.sans,
                fontWeight: 700,
                fontSize: 15,
                color: "#93C5FD",
              }}
            >
              RETINAL INPUT
            </div>
          </GlowSweepFrame>

          <GlassNodeCard
            label={`${msVal} Milliseconds`}
            variant="cobalt"
            enterFrame={3}
          />
        </div>

        {/* RIGHT: Visual Cortex "Human Perception" Connected Node (f=32+) */}
        <div
          style={{
            position: "absolute",
            right: 84,
            top: 270,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <GlassNodeCard
            label="Human Perception"
            variant="lime"
            enterFrame={33}
            dotSide="left"
          />
          <GlassNodeCard
            label="Visual Cortex Stitch"
            variant="dark"
            enterFrame={42}
            dotSide="left"
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * WORLD 3 (local frames 0..106 | global 7.44s - 11.68s):
 * Recursive Zoom-Out into a 3x3 Real Photographic Video Wall!
 * Violent Speed-Ramp Whip-Pans & Focus Reticle hunting across opposite corners ("Jump too far, eye hunts in the dark").
 */
export const World3VideoWallHunt: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Recursive zoom-out from center tile (f=0..16)
  const wallZoom = interpolate(frame, [0, 16], [2.85, 1.0], {
    easing: EASE_COMMERCIAL,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 3 violent saccade jumps: Center (0,0) -> Top-Left (0,0 tile idx 0) -> Bottom-Right (idx 8) -> Bottom-Left (idx 6)
  const jump1 = spring({ frame: frame - 18, fps, config: { mass: 0.6, damping: 12, stiffness: 220 } });
  const jump2 = spring({ frame: frame - 44, fps, config: { mass: 0.6, damping: 12, stiffness: 220 } });
  const jump3 = spring({ frame: frame - 70, fps, config: { mass: 0.6, damping: 12, stiffness: 220 } });

  // Target tile coordinates relative to grid center (tile pitch: X = 540px, Y = 310px)
  const focusX =
    0 +
    jump1 * -540 +
    jump2 * (540 - -540) +
    jump3 * (-540 - 540);
  const focusY =
    0 +
    jump1 * -310 +
    jump2 * (310 - -310) +
    jump3 * (310 - 310);

  // Camera violently whip-pans in opposite direction to chase focus!
  const camX = -focusX * 0.58;
  const camY = -focusY * 0.58;

  const isWhipping =
    (frame >= 18 && frame <= 26) ||
    (frame >= 44 && frame <= 52) ||
    (frame >= 70 && frame <= 78);

  const activeIdx =
    frame < 18 ? 4 : frame < 44 ? 0 : frame < 70 ? 8 : 6;

  const tiles = [
    "broll_set_1.jpg",
    "resolve_studio.jpg",
    "broll_fire_5.jpg",
    "world_warm_portrait.jpg",
    "macro_iris.jpg",
    "broll_set_2.jpg",
    "broll_silhouette_3.jpg",
    "world_cobalt_portrait.jpg",
    "editor_silhouette.jpg",
  ];

  return (
    <AbsoluteFill>
      <CobaltStudioBackdrop variant="dark" />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${camX}px, ${camY}px) scale(${wallZoom})`,
          filter: isWhipping ? "blur(5.5px)" : undefined,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 510px)",
            gridTemplateRows: "repeat(3, 286px)",
            gap: 30,
            position: "relative",
          }}
        >
          {tiles.map((src, idx) => {
            const isActive = idx === activeIdx;
            return (
              <div
                key={idx}
                style={{
                  position: "relative",
                  borderRadius: 18,
                  overflow: "hidden",
                  border: isActive
                    ? "3px solid #F59E0B"
                    : "1px solid rgba(148, 163, 184, 0.18)",
                  boxShadow: isActive
                    ? "0 0 50px rgba(245, 158, 11, 0.48)"
                    : "0 18px 40px rgba(0,0,0,0.5)",
                  opacity: frame < 16 ? 1 : isActive ? 1 : 0.16,
                  transform: isActive ? "scale(1.04)" : "scale(0.98)",
                }}
              >
                <Img
                  src={staticFile(`assets/photos/${src}`)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            );
          })}

          {/* Glowing Eye-Hunt Reticle whipping across grid */}
          {frame >= 17 && (
            <div
              style={{
                position: "absolute",
                left: 795 + focusX - 54,
                top: 459 + focusY - 54,
                width: 108,
                height: 108,
                borderRadius: "50%",
                border: "3px solid #F59E0B",
                boxShadow: "0 0 32px rgba(245,158,11,0.75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#FFFFFF" }} />
            </div>
          )}
        </div>
      </AbsoluteFill>

      {/* Contextual Callout Pills */}
      <div style={{ position: "absolute", left: 96, bottom: 84, display: "flex", gap: 18 }}>
        <GlassNodeCard label="Jump Focal Point Too Far" variant="cobalt" enterFrame={18} />
        <GlassNodeCard label="Eye Hunts in the Dark" variant="dark" enterFrame={54} />
      </div>
    </AbsoluteFill>
  );
};

/**
 * WORLD 4 (local frames 0..92 | global 11.52s - 15.20s):
 * push.mp4 (t=78s Adidas | Puma) Split-Portrait Eye-Trace Match Cut!
 * Sunlit Desert Canyon Filmmaker & Rainy Cobalt Tokyo Filmmaker lock at the exact pupil line!
 */
export const World4SplitFaceEyeLock: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lockSpring = spring({
    frame: frame - 28,
    fps,
    config: { mass: 0.85, damping: 15, stiffness: 145 },
  });

  // Before lockSpring=1, left & right halves are vertically/horizontally misaligned; then snap flush on the 50% nose-bridge midline!
  const misalignY = (1 - lockSpring) * 145;
  const splitPct = 50 + (frame >= 44 ? Math.sin((frame - 44) * 0.09) * 0.9 : 0);

  const stageScale = interpolate(frame, [0, 92], [0.95, 1.06], {
    easing: EASE_COMMERCIAL,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <CobaltStudioBackdrop variant="dark" />

      <div style={{ transform: `scale(${stageScale})` }}>
        <GlowSweepFrame width={1480} height={810} radius={28} showReticles>
          {/* RIGHT WORLD (Base): Rain-Soaked Cobalt Tokyo Night Filmmaker */}
          <AbsoluteFill
            style={{
              transform: `translateY(${misalignY}px)`,
            }}
          >
            <Img
              src={staticFile("assets/photos/world_cobalt_portrait.jpg")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>

          {/* LEFT WORLD (Clipped at splitPct%): Golden-Hour Desert Canyon Filmmaker (1.05x chin-matched!) */}
          <AbsoluteFill
            style={{
              clipPath: `inset(0 ${100 - splitPct}% 0 0)`,
              transform: `translateY(${-misalignY}px)`,
            }}
          >
            <Img
              src={staticFile("assets/photos/world_warm_portrait.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scale(1.05)",
                transformOrigin: "50% 37%",
              }}
            />
          </AbsoluteFill>

          {/* Glowing Vertical Split-Screen Match-Cut Bar & Center Eye-Lock Ring */}
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
          <div
            style={{
              position: "absolute",
              left: `${splitPct}%`,
              top: "74%",
              width: 56,
              height: 56,
              marginLeft: -28,
              marginTop: -28,
              borderRadius: "50%",
              backgroundColor: "rgba(8, 17, 38, 0.88)",
              border: "3px solid #84CC16",
              boxShadow: "0 0 28px rgba(132, 204, 22, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontFamily: FONTS.sans,
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            ↔
          </div>

          {/* Floating World Badges & Fused Headline */}
          <div style={{ position: "absolute", left: 36, top: 32 }}>
            <GlassNodeCard label="Lock the Gaze" variant="cobalt" enterFrame={4} />
          </div>
          <div style={{ position: "absolute", right: 36, bottom: 34 }}>
            <GlassNodeCard
              label="Two Worlds Fuse Into One"
              variant="lime"
              enterFrame={32}
              dotSide="left"
            />
          </div>
        </GlowSweepFrame>
      </div>
    </AbsoluteFill>
  );
};
