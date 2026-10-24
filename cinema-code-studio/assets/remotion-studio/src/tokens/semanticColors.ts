/**
 * Meaning colors. They live in their own hue lanes (see scripts/validate_color_script.py)
 * so "wrong / right / careful" cues are legible without drifting into violet or neon.
 */
export const SEMANTIC = {
  success: "#84CC16", // lime, "right / done / go"
  error: "#E5484D", // red, "wrong / stop / mistake"
  warning: "#F5A524", // amber, "careful"
  info: "#1D63ED", // cobalt, "neutral emphasis"
  neutral: "#8A93A6",
} as const;

export type Tone = "cobalt" | "lime" | "white" | "red" | "dark";

export const toneColors = (
  tone: Tone,
  surface: string,
): { bg: string; fg: string } => {
  switch (tone) {
    case "cobalt":
      return { bg: SEMANTIC.info, fg: "#F8FAFC" };
    case "lime":
      return { bg: SEMANTIC.success, fg: "#0B1A04" };
    case "red":
      return { bg: SEMANTIC.error, fg: "#FFFFFF" };
    case "white":
      return { bg: "#F8FAFC", fg: "#0B1630" };
    case "dark":
    default:
      return { bg: surface, fg: "#F8FAFC" };
  }
};
