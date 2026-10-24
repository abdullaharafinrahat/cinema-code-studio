import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { MasterTimelineData, TimelineScene } from "./types/timeline";
import { STUDIO_PALETTES } from "./tokens/oklchPalettes";
import { ColorGradeLayer } from "./grading/ColorGradeLayer";
import { OpticalTexture } from "./grading/OpticalTexture";
import { CameraRig25D } from "./primitives/CameraRig25D";
import { FootageCut } from "./primitives/FootageCut";
import { VisualMetaphorStage } from "./primitives/VisualMetaphorStage";
import { EditorialCaptions } from "./primitives/EditorialCaptions";
import { RecipeStage } from "./recipes/RecipeStage";

export type MasterSequenceProps = {
  timeline: MasterTimelineData;
};

const SceneRenderer: React.FC<{
  scene: TimelineScene;
  defaultWorld: MasterTimelineData["meta"]["visualWorld"];
  isFirstScene: boolean;
}> = ({ scene, defaultWorld, isFirstScene }) => {
  const paletteId = scene.gradeMood?.paletteId ?? defaultWorld;
  const palette = STUDIO_PALETTES[paletteId] ?? STUDIO_PALETTES.SWISS_EDITORIAL_DARK;

  return (
    <ColorGradeLayer mood={scene.gradeMood}>
      <CameraRig25D>
        {scene.kind === "RECIPE" ? (
          <RecipeStage scene={scene} palette={palette} />
        ) : scene.kind === "FOOTAGE" && scene.footage ? (
          <FootageCut footage={scene.footage} />
        ) : scene.kind === "HYBRID_COMPOSITE" && scene.footage ? (
          <AbsoluteFill>
            <FootageCut footage={scene.footage} />
            <VisualMetaphorStage
              archetype={scene.archetype}
              palette={palette}
              props={scene.props}
              isFirstScene={isFirstScene}
            />
          </AbsoluteFill>
        ) : (
          <VisualMetaphorStage
            archetype={scene.archetype}
            palette={palette}
            props={scene.props}
            isFirstScene={isFirstScene}
          />
        )}
      </CameraRig25D>
    </ColorGradeLayer>
  );
};

export const MasterSequence: React.FC<MasterSequenceProps> = ({ timeline }) => {
  const globalFrame = useCurrentFrame();
  const basePalette =
    STUDIO_PALETTES[timeline.meta.visualWorld] ?? STUDIO_PALETTES.SWISS_EDITORIAL_DARK;

  // Determine whether captions are active at the current global frame (Mayer's Law)
  let cursor = 0;
  let activeCaptionFlag = false;
  for (let i = 0; i < timeline.scenes.length; i++) {
    const sc = timeline.scenes[i];
    const overlap =
      i < timeline.scenes.length - 1 &&
      sc.transitionAfter &&
      sc.transitionAfter.type !== "none"
        ? sc.transitionAfter.durationInFrames
        : 0;
    const end = cursor + sc.durationInFrames - overlap;
    if (globalFrame >= cursor && globalFrame < end + overlap) {
      activeCaptionFlag = sc.captionsActive ?? false;
    }
    cursor = end;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: basePalette.dominantBg }}>
      <TransitionSeries>
        {timeline.scenes.map((scene, index) => {
          const trans = scene.transitionAfter;
          const hasTransition =
            index < timeline.scenes.length - 1 &&
            trans &&
            trans.type !== "none" &&
            trans.durationInFrames > 0;

          return (
            <React.Fragment key={scene.id}>
              <TransitionSeries.Sequence durationInFrames={scene.durationInFrames}>
                <SceneRenderer
                  scene={scene}
                  defaultWorld={timeline.meta.visualWorld}
                  isFirstScene={index === 0}
                />
              </TransitionSeries.Sequence>

              {hasTransition && trans.type === "fade" && (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={linearTiming({ durationInFrames: trans.durationInFrames })}
                />
              )}
              {hasTransition && (trans.type === "wipe-right" || trans.type === "camera-push") && (
                <TransitionSeries.Transition
                  presentation={wipe({ direction: "from-left" })}
                  timing={linearTiming({ durationInFrames: trans.durationInFrames })}
                />
              )}
              {hasTransition && trans.type === "wipe-up" && (
                <TransitionSeries.Transition
                  presentation={wipe({ direction: "from-bottom" })}
                  timing={linearTiming({ durationInFrames: trans.durationInFrames })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      <EditorialCaptions
        words={timeline.captions?.words}
        active={activeCaptionFlag}
        palette={basePalette}
      />

      {/* Unified 35mm optical emulsion & subtle lens vignette over all layers */}
      <OpticalTexture
        grainOpacity={timeline.meta.grainOpacity ?? 0.035}
        vignetteStrength={timeline.meta.vignetteStrength ?? 0.14}
      />
    </AbsoluteFill>
  );
};
