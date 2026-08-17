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
  { id: "none", name: "Natural", filterType: "none", overlay: null },
  { id: "classic", name: "Classic B&W", filterType: "bw", overlay: null },
  { id: "film", name: "35mm Vintage", filterType: "vintage", overlay: null },
  { id: "sepia", name: "Sepia", filterType: "sepia", overlay: null },
  { id: "dog", name: "🐶 Doggy", filterType: "warm", overlay: "dog" },
  { id: "fox", name: "🦊 Fox", filterType: "warm", overlay: "fox" },
  { id: "hearts", name: "👑 Heart Crown", filterType: "warm", overlay: "hearts" },
  { id: "cool", name: "🕶️ Shades", filterType: "none", overlay: "cool" },
];

export const STRIP_THEMES = [
  { id: "classic", name: "01 - Classic" },
  { id: "royal", name: "02 - Royal" },
  { id: "film", name: "03 - Film" },
  { id: "scrapbook", name: "04 - Scrapbook" },
  { id: "editorial", name: "05 - Editorial" },
];

export const COUNTDOWN_LEAD_MS = 3600;
