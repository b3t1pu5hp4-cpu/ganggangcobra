export const MEMBERS = [
  { id: "tehniyet", name: "Tehniyet" },
  { id: "zyna", name: "Zyna" },
  { id: "lakshyata", name: "Lakshyata" },
  { id: "muaz", name: "Muaz" },
  { id: "aydaan", name: "Aydaan" },
  { id: "ayaan", name: "Ayaan" },
];

export const MAX_PARTICIPANTS = 6;
export const TOTAL_SHOTS = 3;

export const SHOT_PROMPTS = [
  { label: "Shot 1", cue: "Act natural & strike a classic pose.", pose: "Classic" },
  { label: "Shot 2", cue: "Give us your funniest expression.", pose: "Funny" },
  { label: "Shot 3", cue: "Strike a dramatic heart or signature pose.", pose: "Heart" },
];

export const FILTERS = [
  { id: "none", name: "Natural", css: "none", overlay: null },
  { id: "classic", name: "Classic B&W", css: "grayscale(1) contrast(1.2)", overlay: null },
  { id: "film", name: "35mm Film", css: "contrast(1.1) saturate(1.2) sepia(0.2)", overlay: null },
  { id: "sepia", name: "Sepia", css: "sepia(0.8) contrast(1.1)", overlay: null },
  { id: "noir", name: "Noir", css: "grayscale(1) contrast(1.5) brightness(0.85)", overlay: null },
  { id: "dog", name: "🐶 Doggy", css: "contrast(1.05) saturate(1.15)", overlay: "dog" },
  { id: "fox", name: "🦊 Fox", css: "sepia(0.25) saturate(1.3)", overlay: "fox" },
  { id: "hearts", name: "👑 Heart Crown", css: "brightness(1.05) saturate(1.2)", overlay: "hearts" },
  { id: "cool", name: "🕶️ Retro Shades", css: "contrast(1.2) brightness(0.95)", overlay: "cool" },
];

export const STRIP_THUMB_THEMES = [
  { id: "classic", name: "01 - Classic" },
  { id: "royal", name: "02 - Royal" },
  { id: "film", name: "03 - Film" },
  { id: "scrapbook", name: "04 - Scrapbook" },
  { id: "editorial", name: "05 - Editorial" },
];

export const STRIP_THEMES = STRIP_THUMB_THEMES;
export const COUNTDOWN_LEAD_MS = 3600;
