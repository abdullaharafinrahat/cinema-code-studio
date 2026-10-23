import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BokehRingWipe } from "./CommercialPrimitives";
import {
  World1EditorToNle,
  World2PerceptionXray,
  World3VideoWallHunt,
  World4SplitFaceEyeLock,
} from "./WorldsPart1";
import {
  World5And6ShadowHero,
  World7AcceleratingTimeline,
  World8WaveformSilenceDrop,
  World9CodeCinemaFinale,
} from "./WorldsPart2";

export const InvisibleCutCommercial: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#040A18" }}>
      {/* WORLD 1 (0.00s - 4.48s | f=0..112): Silhouette -> Recursive Zoom-Out to NLE -> Software Strikeout */}
      <Sequence from={0} durationInFrames={112} name="World1_EditorToNle">
        <World1EditorToNle />
      </Sequence>

      {/* WORLD 2 (4.48s - 7.52s | f=112..188): Glowing Studio Ring + X-Ray Skull & Cobalt Brain + 60ms Iris */}
      <Sequence from={112} durationInFrames={76} name="World2_PerceptionXray">
        <World2PerceptionXray />
      </Sequence>

      {/* WORLD 3 (7.52s - 11.52s | f=188..288): Recursive Zoom-Out to 3x3 Cinema Wall + Violent Eye-Hunt Whip-Pans */}
      <Sequence from={188} durationInFrames={100} name="World3_VideoWallHunt">
        <World3VideoWallHunt />
      </Sequence>

      {/* WORLD 4 (11.52s - 15.12s | f=288..378): Split-Portrait Eye-Lock Match-Cut ("Two worlds fuse into one") */}
      <Sequence from={288} durationInFrames={90} name="World4_SplitFaceEyeLock">
        <World4SplitFaceEyeLock />
      </Sequence>

      {/* WORLDS 5 & 6 (15.12s - 24.00s | f=378..600): Glare Shatter -> 90% Shadow Discipline -> 1 Hero + 3-Node Tree */}
      <Sequence from={378} durationInFrames={222} name="World5_6_ShadowHero">
        <World5And6ShadowHero />
      </Sequence>

      {/* WORLD 7 (24.00s - 26.48s | f=600..662): Accelerating NLE Playhead + Rapid Cinema B-Roll Cuts */}
      <Sequence from={600} durationInFrames={62} name="World7_AcceleratingTimeline">
        <World7AcceleratingTimeline />
      </Sequence>

      {/* WORLD 8 (26.48s - 30.64s | f=662..766): Stereo Spectrum + Cursor Mute Click -> f=750..765 (-inf dB Blackout) */}
      <Sequence from={662} durationInFrames={104} name="World8_WaveformSilenceDrop">
        <World8WaveformSilenceDrop />
      </Sequence>

      {/* WORLD 9 (30.64s - 36.52s | f=766..913): Bright Studio Daylight + Stack Icons + CLI Pill + 3D Studio Display */}
      <Sequence from={766} durationInFrames={147} name="World9_CodeCinemaFinale">
        <World9CodeCinemaFinale />
      </Sequence>

      {/* Foreground Optical Ring-Light Bokeh Wipes (push.mp4 signature transition polish!) */}
      <BokehRingWipe triggerFrame={106} durationFrames={12} direction="left-to-right" />
      <BokehRingWipe triggerFrame={183} durationFrames={10} direction="right-to-left" />
      <BokehRingWipe triggerFrame={282} durationFrames={12} direction="left-to-right" />
      <BokehRingWipe triggerFrame={372} durationFrames={12} direction="right-to-left" />
      <BokehRingWipe triggerFrame={594} durationFrames={12} direction="left-to-right" />
    </AbsoluteFill>
  );
};
