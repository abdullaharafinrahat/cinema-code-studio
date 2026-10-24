export type VisualWorldId =
  | "COMMERCIAL_MIXED_MEDIA"
  | "SWISS_EDITORIAL_DARK"
  | "TACTILE_PAPER_CRAFT"
  | "PRECISION_CINEMA_LAB"
  | "KINETIC_PULSE_SOCIAL";

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  startFrame?: number;
  endFrame?: number;
}

export interface FootageSpec {
  src: string;
  trimBeforeFrames?: number;
  scale?: number;
  anchorEye?: [number, number];
  jCutLeadFrames?: number;
  lCutTrailFrames?: number;
  /** Speaker face box [x, y, w, h], normalized 0..1 (from eyes.json `dominantFaceBox`). Recipes keep overlays off it. */
  faceBox?: [number, number, number, number];
}

export type RecipeId =
  | "SPEAKER_ORBIT_PILLS"
  | "STEP_LABELS"
  | "WRONG_RIGHT_CARDS"
  | "MINI_SPEAKER_FRAME"
  | "TITLE_CARD";

export interface RecipeSpec {
  id: RecipeId;
  params?: Record<string, unknown>;
}

export interface GradeMoodSpec {
  paletteId?: VisualWorldId;
  saturation?: number;
  contrast?: number;
  temperatureShift?: number; // -1.0 (cool slate) to +1.0 (warm golden)
}

export interface TransitionSpec {
  type: "none" | "wipe-right" | "wipe-up" | "fade" | "camera-push";
  durationInFrames: number;
}

/**
 * Layout archetypes available to VisualMetaphorStage.
 * Keep in sync with ALLOWED_ARCHETYPES in scripts/audit_edit_diversity.py.
 */
export type StageArchetype =
  | "HERO_STATEMENT"
  | "COMPARATIVE_BARS"
  | "TERMINAL_FLOW"
  | "METRIC_PROOF"
  | "SEQUENCE_STEPS"
  | "PULL_QUOTE";

export interface TimelineScene {
  id: string;
  shotId: string;
  durationInFrames: number;
  kind: "FOOTAGE" | "MOTION_SCENE" | "HYBRID_COMPOSITE" | "RECIPE";
  component?: string;
  archetype?: StageArchetype;
  /** For kind "RECIPE": a library recipe from assets/recipes/recipes.json plus its params. */
  recipe?: RecipeSpec;
  props?: Record<string, unknown>;
  footage?: FootageSpec;
  gradeMood?: GradeMoodSpec;
  captionsActive?: boolean;
  transitionAfter?: TransitionSpec;
}

export interface MasterTimelineData {
  meta: {
    title: string;
    fps: number;
    width: number;
    height: number;
    visualWorld: VisualWorldId;
    grainOpacity?: number;
    vignetteStrength?: number;
  };
  scenes: TimelineScene[];
  captions?: {
    words?: WordTimestamp[];
    style?: "editorial-clean" | "kinetic-pop" | "minimal-lower";
  };
}
