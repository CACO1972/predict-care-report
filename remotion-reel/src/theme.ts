import { loadFont as loadDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

export const display = loadDisplay("normal", { weights: ["700", "900"], subsets: ["latin"] }).fontFamily;
export const body = loadBody("normal", { weights: ["300", "400", "600", "700"], subsets: ["latin"] }).fontFamily;

export const GOLD = "#C9A86C";
export const GOLD_LIGHT = "#E8CC94";
export const NAVY = "#0B1E3A";
export const CREAM = "#F5EFE3";
