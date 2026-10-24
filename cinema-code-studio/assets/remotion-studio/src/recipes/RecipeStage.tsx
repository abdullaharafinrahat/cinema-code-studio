import React from "react";
import { AbsoluteFill } from "remotion";
import { TimelineScene } from "../types/timeline";
import { StudioPalette } from "../tokens/oklchPalettes";
import { FootageCut } from "../primitives/FootageCut";
import { DEFAULT_FACE_BOX } from "../tokens/faceSafe";
import { SpeakerOrbitPills, SpeakerOrbitPillsParams } from "./SpeakerOrbitPills";
import { WrongRightCards, WrongRightCardsParams } from "./WrongRightCards";
import { StepLabels, StepLabelsParams } from "./StepLabels";
import { TitleCard, TitleCardParams } from "./TitleCard";
import { MiniSpeakerFrame, MiniSpeakerFrameParams } from "./MiniSpeakerFrame";

/**
 * Renders a scene of kind "RECIPE". Unknown recipe ids throw: a silent fallback would hide a
 * storyboard that references a recipe this template cannot render.
 */
export const RecipeStage: React.FC<{ scene: TimelineScene; palette: StudioPalette }> = ({ scene, palette }) => {
  const recipe = scene.recipe;
  if (!recipe) throw new Error(`Scene ${scene.id} has kind RECIPE but no recipe field.`);

  const fb = scene.footage?.faceBox;
  const faceBox = fb ? { x: fb[0], y: fb[1], w: fb[2], h: fb[3] } : DEFAULT_FACE_BOX;
  const params = (recipe.params ?? {}) as Record<string, unknown>;

  const overFootage = (node: React.ReactNode) => (
    <AbsoluteFill>
      {scene.footage ? <FootageCut footage={scene.footage} /> : <AbsoluteFill style={{ background: palette.dominantBg }} />}
      {node}
    </AbsoluteFill>
  );

  switch (recipe.id) {
    case "SPEAKER_ORBIT_PILLS":
      return overFootage(<SpeakerOrbitPills params={{ faceBox, ...(params as unknown as SpeakerOrbitPillsParams) }} palette={palette} />);
    case "WRONG_RIGHT_CARDS":
      return overFootage(<WrongRightCards params={{ faceBox, ...(params as unknown as WrongRightCardsParams) }} palette={palette} />);
    case "STEP_LABELS":
      return <StepLabels params={params as unknown as StepLabelsParams} palette={palette} />;
    case "TITLE_CARD":
      return <TitleCard params={params as unknown as TitleCardParams} palette={palette} />;
    case "MINI_SPEAKER_FRAME":
      if (!scene.footage) throw new Error(`Scene ${scene.id}: MINI_SPEAKER_FRAME needs scene.footage.`);
      return <MiniSpeakerFrame params={params as unknown as MiniSpeakerFrameParams} footage={scene.footage} palette={palette} />;
    default:
      throw new Error(`Unknown recipe id: ${String(recipe.id)}`);
  }
};
