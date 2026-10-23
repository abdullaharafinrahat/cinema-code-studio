import { Easing, SpringConfig } from "remotion";

/**
 * Emotionally calibrated physical mass & damping profiles.
 * Never invent random spring numbers inside individual scene components.
 */
export const SPRING_PRESETS: Record<
  "editorial" | "snappy" | "tactile" | "heavyCinema",
  SpringConfig
> = {
  /** Zero overshoot, luxury smooth deceleration for headlines & serious data */
  editorial: {
    mass: 1.0,
    damping: 26,
    stiffness: 185,
    overshootClamping: false,
  },
  /** Immediate crisp UI response for cursors, terminal lines, and pills */
  snappy: {
    mass: 0.65,
    damping: 18,
    stiffness: 290,
    overshootClamping: false,
  },
  /** Physical ~7% micro-snap for focal badges, checkmarks, and toggles */
  tactile: {
    mass: 0.85,
    damping: 14,
    stiffness: 240,
    overshootClamping: false,
  },
  /** High-inertia dolly rig for 2.5D virtual camera world movements */
  heavyCinema: {
    mass: 2.1,
    damping: 36,
    stiffness: 85,
    overshootClamping: false,
  },
};

export const STUDIO_EASINGS = {
  /** Slow coil of tension -> whip midpoint -> sharp lock */
  tensionSnap: Easing.bezier(0.85, 0.0, 0.15, 1.0),
  /** Silk exit deceleration */
  cinemaOut: Easing.bezier(0.16, 1.0, 0.3, 1.0),
  /** Gentle anticipation wind-up */
  anticipationIn: Easing.bezier(0.36, 0.0, 0.66, -0.56),
};
