import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";

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

export const FONTS = {
  serif: serifNormal.fontFamily,
  serifItalic: serifItalic.fontFamily,
  sans: sans.fontFamily,
};
