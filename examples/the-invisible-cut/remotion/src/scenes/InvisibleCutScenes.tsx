import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { STUDIO_PALETTES } from "../tokens/oklchPalettes";
import { SPRING_PRESETS, STUDIO_EASINGS } from "../tokens/springPhysics";
import { getSafeZone } from "../tokens/framingGrids";
import { KineticTypography } from "../primitives/KineticTypography";

const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
const SANS = "'Inter', 'DejaVu Sans', system-ui, sans-serif";

/**
 * S01 (0.00s - 2.00s): Frame-0 In-Medias-Res Analog Film Splice
 * Matte Warm Carbon (#141311), Silver-Gelatin Bone (#EDE7DA), Aged Kodak Brass (#C8963E)
 */
export const Shot01HookSplice: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pal = STUDIO_PALETTES.SWISS_EDITORIAL_DARK;
  const safe = getSafeZone(width, height);

  const spliceX = interpolate(frame, [0, 120], [64, 68], {
    easing: STUDIO_EASINGS.cinemaOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badgeSpring = spring({
    frame: frame + 18,
    fps,
    config: SPRING_PRESETS.editorial,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: pal.dominantBg }}>
      {/* Tactile Swiss Registration Frame */}
      <div
        style={{
          position: "absolute",
          inset: `${safe.topPx}px ${safe.rightPx}px ${safe.bottomPx}px ${safe.leftPx}px`,
          border: `1px solid ${pal.hairlineBorder}`,
        }}
      />

      {/* Subtle warm smoked-stone tonal panel to the right of splice */}
      <div
        style={{
          position: "absolute",
          top: safe.topPx,
          bottom: safe.bottomPx,
          left: `${spliceX}%`,
          right: safe.rightPx,
          backgroundColor: "rgba(237, 231, 218, 0.028)",
        }}
      />

      {/* Matte Aged-Brass Physical Splice Rule (zero neon outer glow) */}
      <div
        style={{
          position: "absolute",
          top: safe.topPx,
          bottom: safe.bottomPx,
          left: `${spliceX}%`,
          width: 2,
          backgroundColor: pal.heroAccent,
        }}
      />
      {/* Precision Rangefinder Registration Mark */}
      <div
        style={{
          position: "absolute",
          top: "46%",
          left: `${spliceX}%`,
          width: 22,
          height: 22,
          marginLeft: -11,
          marginTop: -11,
          borderRadius: "50%",
          border: `2px solid ${pal.heroAccent}`,
          backgroundColor: pal.dominantBg,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "46%",
          left: `calc(${spliceX}% + 22px)`,
          transform: "translateY(-50%)",
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: "0.12em",
          color: pal.heroAccent,
        }}
      >
        SPLICE // 0.06s
      </div>

      {/* Top Editorial Header */}
      <div
        style={{
          position: "absolute",
          top: safe.topPx + 28,
          left: safe.leftPx + 36,
          right: safe.rightPx + 36,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: 17,
          letterSpacing: "0.10em",
          color: pal.mutedContextText,
          fontVariantNumeric: "tabular-nums",
          opacity: badgeSpring,
        }}
      >
        <span style={{ color: pal.heroAccent }}>01 / THE INVISIBLE CUT</span>
        <span>35MM GATE  ·  TC 00:00:00:{String(frame % 60).padStart(2, "0")}</span>
      </div>

      {/* Masked Swiss Headline fully clear on Frame 0 */}
      <div
        style={{
          position: "absolute",
          top: "33%",
          left: safe.leftPx + 48,
          maxWidth: 920,
        }}
      >
        <KineticTypography
          lines={["You Never Notice", "A Great Cut."]}
          accentWord="Cut."
          color={pal.primaryText}
          accentColor={pal.heroAccent}
          fontSizePx={94}
          fontFamily={SANS}
          frameZeroLead={26}
        />
      </div>
    </AbsoluteFill>
  );
};

/**
 * S02 (2.00s - 7.40s): 60 Milliseconds — Braun-Inspired Mechanical Chronometer
 */
export const Shot02Perception60ms: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pal = STUDIO_PALETTES.SWISS_EDITORIAL_DARK;
  const safe = getSafeZone(width, height);

  const dialSpring = spring({
    frame: frame - 55,
    fps,
    config: SPRING_PRESETS.tactile,
  });

  const msReadout = interpolate(dialSpring, [0, 1], [400, 60], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const radius = 162;
  const circum = 2 * Math.PI * radius;
  const arcProgress = interpolate(dialSpring, [0, 1], [0.82, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.dominantBg,
        padding: `${safe.topPx}px ${safe.rightPx}px ${safe.bottomPx}px ${safe.leftPx}px`,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left 50%: Editorial Thesis */}
      <div style={{ width: "50%", display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 17,
            letterSpacing: "0.12em",
            color: pal.heroAccent,
            textTransform: "uppercase",
          }}
        >
          02 / PERCEPTUAL THRESHOLD
        </div>
        <KineticTypography
          lines={["Not Software.", "60 Milliseconds", "of Perception."]}
          accentWord="60"
          color={pal.primaryText}
          accentColor={pal.heroAccent}
          fontSizePx={76}
          fontFamily={SANS}
          staggerFrames={6}
        />
        <div
          style={{
            marginTop: 12,
            fontFamily: SANS,
            fontSize: 25,
            lineHeight: 1.45,
            color: pal.mutedContextText,
            maxWidth: 620,
            opacity: interpolate(frame, [24, 50], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Faster than a human blink, the visual cortex stitches two frames into continuous reality.
        </div>
      </div>

      {/* Right 46%: Matte Braun-Inspired Chronometer Dial */}
      <div
        style={{
          width: "46%",
          height: 460,
          borderRadius: 12,
          backgroundColor: pal.secondarySurface,
          border: `1px solid ${pal.hairlineBorder}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <svg width={400} height={400} viewBox="0 0 400 400">
          {/* Fine mechanical dial ticks */}
          {Array.from({ length: 36 }).map((_, idx) => {
            const deg = idx * 10;
            const rad = (deg * Math.PI) / 180;
            const r1 = idx % 3 === 0 ? 182 : 187;
            const r2 = 194;
            return (
              <line
                key={idx}
                x1={200 + r1 * Math.cos(rad)}
                y1={200 + r1 * Math.sin(rad)}
                x2={200 + r2 * Math.cos(rad)}
                y2={200 + r2 * Math.sin(rad)}
                stroke="rgba(237, 231, 218, 0.22)"
                strokeWidth={idx % 3 === 0 ? 2 : 1}
              />
            );
          })}
          <circle
            cx={200}
            cy={200}
            r={radius}
            fill="none"
            stroke="rgba(237, 231, 218, 0.09)"
            strokeWidth={10}
          />
          <circle
            cx={200}
            cy={200}
            r={radius}
            fill="none"
            stroke={pal.heroAccent}
            strokeWidth={10}
            strokeLinecap="butt"
            strokeDasharray={circum}
            strokeDashoffset={circum * (1 - arcProgress)}
            transform="rotate(-90 200 200)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: pal.primaryText,
            }}
          >
            {Math.round(msReadout)}
            <span style={{ fontSize: 40, color: pal.heroAccent, marginLeft: 6 }}>ms</span>
          </span>
          <span
            style={{
              marginTop: 6,
              fontFamily: MONO,
              fontSize: 15,
              letterSpacing: "0.12em",
              color: pal.mutedContextText,
            }}
          >
            FOVEAL SPLICE WINDOW
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * S03 (7.40s - 11.20s): Broken Eye-Trace — Matte Terracotta Optical Crosshair
 */
export const Shot03EyeTraceBroken: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pal = STUDIO_PALETTES.SWISS_EDITORIAL_DARK;
  const safe = getSafeZone(width, height);

  const waypoints: Array<[number, number, string]> = [
    [0.50, 0.48, "d = 0.00"],
    [0.16, 0.22, "d = 0.43 [HUNT]"],
    [0.84, 0.78, "d = 0.88 [LOST]"],
    [0.20, 0.76, "d = 0.64 [LOST]"],
    [0.50, 0.46, "ALIGNING..."],
  ];

  const segFrames = 52;
  const segIdx = Math.min(waypoints.length - 2, Math.floor(frame / segFrames));
  const localF = frame - segIdx * segFrames;
  const moveSpring = spring({
    frame: localF,
    fps,
    config: SPRING_PRESETS.snappy,
  });

  const [x1, y1] = waypoints[segIdx];
  const [x2, y2, statusLabel] = waypoints[segIdx + 1];
  const curX = interpolate(moveSpring, [0, 1], [x1, x2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const curY = interpolate(moveSpring, [0, 1], [y1, y2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stageW = 1560;
  const stageH = 560;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.dominantBg,
        padding: `${safe.topPx}px ${safe.rightPx}px ${safe.bottomPx}px ${safe.leftPx}px`,
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <KineticTypography
          lines={["Jump Too Far, and the Eye Hunts."]}
          accentWord="Hunts."
          color={pal.primaryText}
          accentColor={pal.tensionRust}
          fontSizePx={60}
          fontFamily={SANS}
        />
        <div
          style={{
            padding: "9px 20px",
            borderRadius: 4,
            backgroundColor: "rgba(200, 75, 49, 0.14)",
            border: `1px solid ${pal.tensionRust}`,
            fontFamily: MONO,
            fontSize: 16,
            color: pal.tensionRust,
            letterSpacing: "0.08em",
          }}
        >
          SACCADE JUMP &gt; 0.32  ·  260ms LOSS
        </div>
      </div>

      {/* 3x3 Draftsmanship Viewfinder */}
      <div
        style={{
          width: stageW,
          height: stageH,
          borderRadius: 10,
          backgroundColor: pal.secondarySurface,
          border: `1px solid ${pal.hairlineBorder}`,
          position: "relative",
          overflow: "hidden",
          alignSelf: "center",
        }}
      >
        <svg width={stageW} height={stageH}>
          {[1 / 3, 2 / 3].map((f) => (
            <React.Fragment key={f}>
              <line
                x1={stageW * f}
                y1={0}
                x2={stageW * f}
                y2={stageH}
                stroke="rgba(237, 231, 218, 0.10)"
                strokeWidth={1}
              />
              <line
                x1={0}
                y1={stageH * f}
                x2={stageW}
                y2={stageH * f}
                stroke="rgba(237, 231, 218, 0.10)"
                strokeWidth={1}
              />
            </React.Fragment>
          ))}

          {waypoints.slice(1, 4).map(([wx, wy], idx) => (
            <circle
              key={idx}
              cx={wx * stageW}
              cy={wy * stageH}
              r={12}
              fill="none"
              stroke="rgba(200, 75, 49, 0.38)"
              strokeWidth={1.5}
            />
          ))}

          <line
            x1={x1 * stageW}
            y1={y1 * stageH}
            x2={curX * stageW}
            y2={curY * stageH}
            stroke={pal.tensionRust}
            strokeWidth={2.5}
            strokeDasharray="10 8"
          />
        </svg>

        {/* Matte Optical Reticle */}
        <div
          style={{
            position: "absolute",
            left: curX * stageW - 38,
            top: curY * stageH - 38,
            width: 76,
            height: 76,
            borderRadius: "50%",
            border: `2.5px solid ${pal.tensionRust}`,
            backgroundColor: "rgba(200, 75, 49, 0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: pal.primaryText,
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: Math.min(stageW - 260, Math.max(24, curX * stageW + 48)),
            top: Math.min(stageH - 56, Math.max(24, curY * stageH - 14)),
            padding: "6px 12px",
            borderRadius: 4,
            backgroundColor: pal.dominantBg,
            border: `1px solid ${pal.hairlineBorder}`,
            fontFamily: MONO,
            fontSize: 17,
            fontWeight: 700,
            color: pal.tensionRust,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {statusLabel}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * S04 (11.20s - 15.15s): Leica Split-Prism Rangefinder Alignment
 */
export const Shot04EyeTraceLocked: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pal = STUDIO_PALETTES.SWISS_EDITORIAL_DARK;
  const safe = getSafeZone(width, height);

  const fuseSpring = spring({
    frame,
    fps,
    config: SPRING_PRESETS.editorial,
  });

  const offsetPx = interpolate(fuseSpring, [0, 1], [220, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.dominantBg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: safe.topPx,
          padding: "9px 22px",
          borderRadius: 4,
          backgroundColor: pal.heroAccentSoft,
          border: `1px solid ${pal.heroAccent}`,
          fontFamily: MONO,
          fontSize: 16,
          color: pal.heroAccent,
          letterSpacing: "0.10em",
        }}
      >
        WALTER MURCH EYE-TRACE  ·  d = 0.00 [SEAMLESS]
      </div>

      {/* Split-Prism Rangefinder Rings Aligning at [0.50, 0.46] */}
      <div
        style={{
          position: "relative",
          width: 520,
          height: 360,
          marginTop: -28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 248,
            height: 248,
            borderRadius: "50%",
            border: `2.5px solid ${pal.heroAccent}`,
            backgroundColor: "rgba(200, 150, 62, 0.06)",
            transform: `translateX(${-offsetPx}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 248,
            height: 248,
            borderRadius: "50%",
            border: `2px solid ${pal.primaryText}`,
            backgroundColor: "rgba(237, 231, 218, 0.04)",
            transform: `translateX(${offsetPx}px)`,
          }}
        />
        {/* Crisp Brass Center Fiducial */}
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: pal.heroAccent,
          }}
        />
      </div>

      <div style={{ marginTop: 28 }}>
        <KineticTypography
          lines={["Lock the Gaze.", "Two Worlds Fuse Into One."]}
          accentWord="Fuse"
          color={pal.primaryText}
          accentColor={pal.heroAccent}
          fontSizePx={68}
          fontFamily={SANS}
          align="center"
        />
      </div>
    </AbsoluteFill>
  );
};

/**
 * S05 (15.15s - 19.35s): Josef Albers Luminance Glare Study
 * Zero neon/purple! Four stark, identically bright unbleached bone slabs (L = 0.90)
 * visually proving how equal luminance destroys focal hierarchy.
 */
export const Shot05BrightnessShatter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pal = STUDIO_PALETTES.SWISS_EDITORIAL_DARK;
  const safe = getSafeZone(width, height);

  const glareSlabs = [
    { title: "CHANNEL 01", val: "94.2%", luma: "OKLCH L = 0.90" },
    { title: "CHANNEL 02", val: "12.8x", luma: "OKLCH L = 0.90" },
    { title: "CHANNEL 03", val: "+340%", luma: "OKLCH L = 0.90" },
    { title: "CHANNEL 04", val: "0.04s", luma: "OKLCH L = 0.90" },
  ];

  const enter = spring({ frame, fps, config: SPRING_PRESETS.snappy });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.dominantBg,
        padding: `${safe.topPx}px ${safe.rightPx}px ${safe.bottomPx}px ${safe.leftPx}px`,
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <KineticTypography
          lines={["Equal Brightness Shatters Attention."]}
          accentWord="Shatters"
          color={pal.primaryText}
          accentColor={pal.tensionRust}
          fontSizePx={60}
          fontFamily={SANS}
        />
        <div
          style={{
            padding: "8px 18px",
            borderRadius: 4,
            backgroundColor: "rgba(200, 75, 49, 0.14)",
            border: `1px solid ${pal.tensionRust}`,
            fontFamily: MONO,
            fontSize: 16,
            color: pal.tensionRust,
          }}
        >
          SQUINT TEST: 4 EQUAL SLABS [NO HERO]
        </div>
      </div>

      {/* 4 Stark Equal-Luminance Bone Slabs (Zero Hierarchy) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 26,
          marginTop: 20,
          marginBottom: 40,
          transform: `scale(${interpolate(enter, [0, 1], [0.97, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })})`,
        }}
      >
        {glareSlabs.map((c) => (
          <div
            key={c.title}
            style={{
              height: 410,
              borderRadius: 10,
              backgroundColor: "#E5DEC9",
              border: "1px solid #CFC6B0",
              padding: 32,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 700, color: "#524C43" }}>
              {c.title}
            </span>
            <span
              style={{
                fontFamily: SANS,
                fontSize: 74,
                fontWeight: 800,
                color: "#181613",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {c.val}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: "#635D54" }}>
              {c.luma} · COMPETING
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: MONO, fontSize: 17, color: pal.mutedContextText }}>
        UNGRADED LUMINANCE FLOOD  ·  FOUR IDENTICAL WEIGHTS SPLIT FOVEAL FOCUS
      </div>
    </AbsoluteFill>
  );
};

/**
 * S06 (19.35s - 24.15s): 60-30-10 Analog Chiaroscuro Discipline
 * Three slabs recede into Smoked Basalt shadow (L=0.22); ONE Aged-Brass Hero commands focus!
 */
export const Shot06OklchDiscipline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pal = STUDIO_PALETTES.SWISS_EDITORIAL_DARK;
  const safe = getSafeZone(width, height);

  const discipline = spring({
    frame,
    fps,
    config: SPRING_PRESETS.editorial,
  });

  const cards = [
    { title: "CHANNEL 01", val: "94.2%", isHero: false },
    { title: "CHANNEL 02", val: "12.8x", isHero: false },
    { title: "SIGNAL CORE", val: "+340%", isHero: true },
    { title: "CHANNEL 04", val: "0.04s", isHero: false },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.dominantBg,
        padding: `${safe.topPx}px ${safe.rightPx}px ${safe.bottomPx}px ${safe.leftPx}px`,
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <KineticTypography
          lines={["90% Into Shadow. One Hero Commands."]}
          accentWord="Hero"
          color={pal.primaryText}
          accentColor={pal.heroAccent}
          fontSizePx={52}
          fontFamily={SANS}
        />
        <div
          style={{
            padding: "8px 18px",
            borderRadius: 4,
            backgroundColor: pal.heroAccentSoft,
            border: `1px solid ${pal.heroAccent}`,
            fontFamily: MONO,
            fontSize: 16,
            color: pal.heroAccent,
          }}
        >
          OKLCH |ΔL| = +0.52 [CHIAROSCURO LOCK]
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 26,
          marginTop: 20,
          marginBottom: 28,
        }}
      >
        {cards.map((c) => {
          const scale = c.isHero
            ? interpolate(discipline, [0, 1], [1.0, 1.04], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : interpolate(discipline, [0, 1], [1.0, 0.96], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
          const dimOpacity = c.isHero
            ? 1
            : interpolate(discipline, [0, 1], [0.85, 0.35], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

          return (
            <div
              key={c.title}
              style={{
                height: 410,
                borderRadius: 10,
                backgroundColor: c.isHero ? pal.secondarySurface : "#191715",
                border: c.isHero
                  ? `2px solid ${pal.heroAccent}`
                  : `1px solid ${pal.hairlineBorder}`,
                padding: 32,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transform: `scale(${scale})`,
                opacity: dimOpacity,
                boxShadow: c.isHero ? "0 24px 60px rgba(0, 0, 0, 0.55)" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 17,
                  color: c.isHero ? pal.heroAccent : pal.mutedContextText,
                }}
              >
                {c.title}
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 76,
                  fontWeight: 800,
                  color: c.isHero ? pal.primaryText : pal.mutedContextText,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {c.val}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 15,
                  color: c.isHero ? pal.heroAccent : pal.mutedContextText,
                }}
              >
                {c.isHero ? "10% AGED BRASS FOCAL" : "30% BASALT SHADOW"}
              </span>
            </div>
          );
        })}
      </div>

      {/* 60-30-10 Proportional Matte Pigment Bar */}
      <div style={{ display: "flex", gap: 10, height: 16, width: "100%" }}>
        <div
          style={{
            flex: 60,
            borderRadius: 3,
            backgroundColor: "#1B1917",
            border: `1px solid ${pal.hairlineBorder}`,
          }}
        />
        <div
          style={{
            flex: 30,
            borderRadius: 3,
            backgroundColor: pal.mutedContextText,
            opacity: 0.42,
          }}
        />
        <div
          style={{
            flex: 10,
            borderRadius: 3,
            backgroundColor: pal.heroAccent,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/**
 * S07 (24.15s - 27.05s): Accelerating Asymmetric Film-Strip Cadence
 */
export const Shot07AccelerateRhythm: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const pal = STUDIO_PALETTES.KINETIC_PULSE_SOCIAL;
  const safe = getSafeZone(width, height);

  const pushZoom = interpolate(frame, [0, durationInFrames], [1.0, 1.11], {
    easing: STUDIO_EASINGS.cinemaOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const blocks = [
    { dur: "2.80s", flex: 28, triggerF: 6 },
    { dur: "1.90s", flex: 19, triggerF: 44 },
    { dur: "1.15s", flex: 12, triggerF: 78 },
    { dur: "0.68s", flex: 7, triggerF: 108 },
    { dur: "0.38s", flex: 4.5, triggerF: 132 },
    { dur: "0.20s", flex: 2.8, triggerF: 150 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.dominantBg,
        padding: `${safe.topPx}px ${safe.rightPx}px ${safe.bottomPx}px ${safe.leftPx}px`,
        justifyContent: "center",
        transform: `scale(${pushZoom})`,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 17,
          letterSpacing: "0.12em",
          color: pal.heroAccent,
          marginBottom: 20,
        }}
      >
        04 / ASYMMETRIC RHYTHM COMPRESSION
      </div>
      <KineticTypography
        lines={["Accelerate the Cut", "to Build Tension."]}
        accentWord="Tension."
        color={pal.primaryText}
        accentColor={pal.heroAccent}
        fontSizePx={78}
        fontFamily={SANS}
      />

      <div
        style={{
          marginTop: 64,
          display: "flex",
          gap: 14,
          height: 150,
          alignItems: "stretch",
        }}
      >
        {blocks.map((b, i) => {
          const active = frame >= b.triggerF;
          return (
            <div
              key={i}
              style={{
                flex: b.flex,
                borderRadius: 6,
                backgroundColor: active ? pal.heroAccentSoft : pal.secondarySurface,
                border: active ? `2px solid ${pal.heroAccent}` : `1px solid ${pal.hairlineBorder}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 14,
                  color: active ? pal.heroAccent : pal.mutedContextText,
                }}
              >
                C0{i + 1}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 20,
                  fontWeight: 700,
                  color: active ? pal.primaryText : pal.mutedContextText,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {b.dur}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * S08 (27.05s - 30.64s): Analog Bone-Ink Wave -> 33-Frame Dead Silence Thread
 */
export const Shot08SilenceFlatline: React.FC = () => {
  const frame = useCurrentFrame();
  const pal = STUDIO_PALETTES.SWISS_EDITORIAL_DARK;

  const isSilentVacuum = frame >= 182;
  const swell = isSilentVacuum
    ? interpolate(frame, [182, 187], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : interpolate(frame, [0, 181], [0.22, 1.0], {
        easing: STUDIO_EASINGS.tensionSnap,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  const waveW = 1480;
  const waveH = 340;
  const midY = waveH / 2;
  const pts: string[] = [];
  const steps = 160;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const x = u * waveW;
    const env = Math.sin(Math.PI * u) ** 1.6;
    const yOffset =
      (Math.sin(u * 34 + frame * 0.42) * 0.62 +
        Math.sin(u * 71 - frame * 0.65) * 0.38) *
      136 *
      env *
      swell;
    pts.push(`${x.toFixed(1)},${(midY + yOffset).toFixed(1)}`);
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#11100E",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          marginBottom: 34,
          fontFamily: MONO,
          fontSize: 18,
          letterSpacing: "0.14em",
          color: isSilentVacuum ? pal.mutedContextText : pal.heroAccent,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {isSilentVacuum
          ? "PRE-PAYOFF VACUUM  ·  -∞ dBFS  [DEAD SILENCE]"
          : "ACOUSTIC TENSION SWELL  ·  APPROACHING CUT"}
      </div>

      <svg width={waveW} height={waveH}>
        <polyline
          fill="none"
          stroke={isSilentVacuum ? pal.primaryText : pal.heroAccent}
          strokeWidth={isSilentVacuum ? 1.5 : 3}
          points={pts.join(" ")}
        />
      </svg>

      <div
        style={{
          marginTop: 32,
          fontFamily: SANS,
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: pal.primaryText,
          opacity: isSilentVacuum ? 0.38 : 0.94,
        }}
      >
        {isSilentVacuum ? "Wait for the truth to land." : "Drop into dead silence..."}
      </div>
    </AbsoluteFill>
  );
};

/**
 * S09 (30.64s - 36.53s): Macro Polarity Inversion -> Warm Archival Museum Paper (#EFE9DD)
 * Deep Carbon Ink (#181613) + Matte Braun Terracotta (#B8432A) Emblem!
 * Zero digital glow, pure tactile print/cinema physicality.
 */
export const Shot09CinemaGoldPayoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pal = STUDIO_PALETTES.TACTILE_PAPER_CRAFT;
  const safe = getSafeZone(width, height);

  const impactSpring = spring({
    frame,
    fps,
    config: SPRING_PRESETS.tactile,
  });

  const emblemScale = interpolate(impactSpring, [0, 1], [0.72, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [95, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pal.dominantBg,
        alignItems: "center",
        justifyContent: "center",
        padding: `${safe.topPx}px ${safe.rightPx}px ${safe.bottomPx}px ${safe.leftPx}px`,
      }}
    >
      {/* Editorial Print Registration Frame on Museum Stock */}
      <div
        style={{
          position: "absolute",
          inset: `${safe.topPx}px ${safe.rightPx}px ${safe.bottomPx}px ${safe.leftPx}px`,
          border: `1px solid ${pal.hairlineBorder}`,
        }}
      />

      {/* Precision Braun Terracotta & Carbon Ink Aperture Mark */}
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: "50%",
          border: `2.5px solid ${pal.heroAccent}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 38,
          transform: `scale(${emblemScale}) rotate(${interpolate(frame, [0, 350], [0, 24], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}deg)`,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            border: `2px solid ${pal.primaryText}`,
            transform: "rotate(45deg)",
          }}
        />
      </div>

      {/* Deep Carbon Ink & Matte Vermilion Manifesto */}
      <KineticTypography
        lines={["Zero Timelines. Pure Code.", "Cinema by Design."]}
        accentWord="Cinema"
        color={pal.primaryText}
        accentColor={pal.heroAccent}
        fontSizePx={88}
        fontFamily={SANS}
        staggerFrames={24}
        align="center"
      />

      {/* Archival Colophon Footer */}
      <div
        style={{
          marginTop: 48,
          padding: "10px 26px",
          borderRadius: 4,
          border: `1px solid ${pal.hairlineBorder}`,
          backgroundColor: pal.secondarySurface,
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: "0.14em",
          color: pal.mutedContextText,
          opacity: subtitleOpacity,
        }}
      >
        CINEMA CODE STUDIO  ·  ANALOG OKLCH  ·  MURCH EYE-TRACE  ·  -14 LUFS
      </div>
    </AbsoluteFill>
  );
};

export const CUSTOM_SCENE_REGISTRY: Record<string, React.FC> = {
  Shot01HookSplice,
  Shot02Perception60ms,
  Shot03EyeTraceBroken,
  Shot04EyeTraceLocked,
  Shot05BrightnessShatter,
  Shot06OklchDiscipline,
  Shot07AccelerateRhythm,
  Shot08SilenceFlatline,
  Shot09CinemaGoldPayoff,
};
