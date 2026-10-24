import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadHindSiliguri } from "@remotion/google-fonts/HindSiliguri";

const serifNormal = loadInstrumentSerif("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

const serifItalic = loadInstrumentSerif("italic", {
  weights: ["400"],
  subsets: ["latin"],
});

const sans = loadSpaceGrotesk("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});

// Bengali glyph support. Space Grotesk / Instrument Serif have no Bengali glyphs, so any Bengali
// text must use this stack or it silently falls back to a system font (or tofu boxes).
const bengali = loadHindSiliguri("normal", {
  weights: ["500", "700"],
  subsets: ["bengali", "latin"],
});

export const FONTS = {
  serif: serifNormal.fontFamily,
  serifItalic: serifItalic.fontFamily,
  sans: sans.fontFamily,
  bengali: `${bengali.fontFamily}, ${sans.fontFamily}`,
};

export const hasBengali = (text: string): boolean => /[\u0980-\u09FF]/.test(text);

/** Picks the font stack for a string so mixed Bengali/English scripts never hit missing glyphs. */
export const fontFor = (text: string): string => (hasBengali(text) ? FONTS.bengali : FONTS.sans);

/** Bengali matras and conjuncts are tall; give them more line height and clip padding than Latin. */
export const lineHeightFor = (text: string): number => (hasBengali(text) ? 1.4 : 1.1);
