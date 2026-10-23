import { VisualWorldId } from "../types/timeline";

export interface StudioPalette {
  id: VisualWorldId;
  dominantBg: string;        // 60% canvas atmosphere (warm/neutral matte, never cold Tailwind navy)
  secondarySurface: string;  // 30% elevated card/grid architecture
  hairlineBorder: string;    // Subtle 1px structural framing
  primaryText: string;       // Silver-gelatin bone or carbon ink (never raw #FFF / #000)
  mutedContextText: string;  // Warm pewter / stone metadata
  heroAccent: string;        // 10% natural pigment focal accent (OKLCH C <= 0.175, zero neon/purple)
  heroAccentSoft: string;    // Matte tint surface for active hero
  tensionRust: string;       // Earthy iron-oxide terracotta for friction/baseline tension
}

/**
 * Analog Cinema & Print Pigment Palettes calibrated in OKLCH.
 * STRICT ANTI-SLOP POLICY:
 * - Zero purple / violet / magenta hues (275-345 deg banned)
 * - Zero neon cyan, neon green, or hot pink (Chroma capped <= 0.170 like real film dyes & print inks)
 * - Warm carbon / basalt / archival paper neutrals instead of generic blue-black tech slate
 */
export const STUDIO_PALETTES: Record<VisualWorldId, StudioPalette> = {
  SWISS_EDITORIAL_DARK: {
    id: "SWISS_EDITORIAL_DARK",
    dominantBg: "#141311",        // Warm Matte Carbon — oklch(0.188 0.005 75)
    secondarySurface: "#201E1B",  // Smoked Basalt — oklch(0.238 0.007 72)
    hairlineBorder: "rgba(237, 231, 218, 0.11)",
    primaryText: "#EDE7DA",       // Silver-Gelatin Bone — oklch(0.928 0.016 84)
    mutedContextText: "#8E877C",  // Warm Pewter — oklch(0.625 0.015 78)
    heroAccent: "#C8963E",        // Aged Brass / Kodak Ochre — oklch(0.702 0.126 76)
    heroAccentSoft: "rgba(200, 150, 62, 0.14)",
    tensionRust: "#C84B31",       // Braun / Swiss Terracotta — oklch(0.575 0.163 34)
  },
  TACTILE_PAPER_CRAFT: {
    id: "TACTILE_PAPER_CRAFT",
    dominantBg: "#EFE9DD",        // Unbleached Museum Stock — oklch(0.934 0.017 84)
    secondarySurface: "#E3DCCD",  // Warm Stone Card — oklch(0.892 0.020 83)
    hairlineBorder: "rgba(24, 22, 19, 0.12)",
    primaryText: "#181613",       // Deep Carbon Ink — oklch(0.200 0.006 75)
    mutedContextText: "#635D54",  // Warm Umber Gray — oklch(0.482 0.015 76)
    heroAccent: "#B8432A",        // Matte Vermilion Ink — oklch(0.542 0.158 34)
    heroAccentSoft: "rgba(184, 67, 42, 0.11)",
    tensionRust: "#8C3B2B",
  },
  PRECISION_CINEMA_LAB: {
    id: "PRECISION_CINEMA_LAB",
    dominantBg: "#111312",        // Deep Oxide Charcoal — oklch(0.182 0.004 155)
    secondarySurface: "#1B1E1C",  // Matte Slate-Olive — oklch(0.232 0.007 155)
    hairlineBorder: "rgba(235, 231, 222, 0.11)",
    primaryText: "#EBE7DE",       // Warm Celluloid White — oklch(0.926 0.012 85)
    mutedContextText: "#858881",  // Muted Sage-Pewter — oklch(0.622 0.010 135)
    heroAccent: "#D4A359",        // Warm Champagne Tungsten — oklch(0.745 0.114 78)
    heroAccentSoft: "rgba(212, 163, 89, 0.14)",
    tensionRust: "#C2543D",
  },
  KINETIC_PULSE_SOCIAL: {
    id: "KINETIC_PULSE_SOCIAL",
    dominantBg: "#161412",        // Espresso Carbon — oklch(0.192 0.006 68)
    secondarySurface: "#24201D",  // Dark Clay — oklch(0.246 0.009 68)
    hairlineBorder: "rgba(242, 236, 225, 0.13)",
    primaryText: "#F2ECE1",       // Warm Alabaster — oklch(0.942 0.014 84)
    mutedContextText: "#968E83",
    heroAccent: "#D15B3E",        // Tactile Terracotta — oklch(0.618 0.155 36)
    heroAccentSoft: "rgba(209, 91, 62, 0.15)",
    tensionRust: "#B8432A",
  },
};
