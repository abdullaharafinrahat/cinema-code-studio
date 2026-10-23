import { VisualWorldId } from "../types/timeline";

export interface StudioPalette {
  id: VisualWorldId;
  dominantBg: string;
  secondarySurface: string;
  hairlineBorder: string;
  primaryText: string;
  mutedContextText: string;
  heroAccent: string;
  heroAccentSoft: string;
  tensionRust: string;
}

export const STUDIO_PALETTES: Record<VisualWorldId, StudioPalette> = {
  SWISS_EDITORIAL_DARK: {
    id: "SWISS_EDITORIAL_DARK",
    dominantBg: "#141311",        // Warm Matte Carbon
    secondarySurface: "#201E1B",  // Smoked Basalt
    hairlineBorder: "rgba(237, 231, 218, 0.11)",
    primaryText: "#EDE7DA",       // Silver-Gelatin Bone
    mutedContextText: "#8E877C",  // Warm Pewter
    heroAccent: "#C8963E",        // Aged Kodak Brass
    heroAccentSoft: "rgba(200, 150, 62, 0.14)",
    tensionRust: "#C84B31",       // Braun Terracotta
  },
  TACTILE_PAPER_CRAFT: {
    id: "TACTILE_PAPER_CRAFT",
    dominantBg: "#EFE9DD",        // Unbleached Archival Paper
    secondarySurface: "#E3DCCD",  // Warm Stone
    hairlineBorder: "rgba(24, 22, 19, 0.13)",
    primaryText: "#181613",       // Deep Carbon Ink
    mutedContextText: "#635D54",  // Warm Umber Gray
    heroAccent: "#B8432A",        // Matte Vermilion Ink
    heroAccentSoft: "rgba(184, 67, 42, 0.11)",
    tensionRust: "#8C3B2B",
  },
  PRECISION_CINEMA_LAB: {
    id: "PRECISION_CINEMA_LAB",
    dominantBg: "#111312",
    secondarySurface: "#1B1E1C",
    hairlineBorder: "rgba(235, 231, 222, 0.11)",
    primaryText: "#EBE7DE",
    mutedContextText: "#858881",
    heroAccent: "#D4A359",
    heroAccentSoft: "rgba(212, 163, 89, 0.14)",
    tensionRust: "#C2543D",
  },
  KINETIC_PULSE_SOCIAL: {
    id: "KINETIC_PULSE_SOCIAL",
    dominantBg: "#161412",
    secondarySurface: "#24201D",
    hairlineBorder: "rgba(242, 236, 225, 0.13)",
    primaryText: "#F2ECE1",
    mutedContextText: "#968E83",
    heroAccent: "#D15B3E",
    heroAccentSoft: "rgba(209, 91, 62, 0.15)",
    tensionRust: "#B8432A",
  },
};
