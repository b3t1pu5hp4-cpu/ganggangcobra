export const MEMBERS = [
  { id: "tehniyet", name: "Tehniyet" },
  { id: "zyna", name: "Zyna" },
  { id: "lakshyata", name: "Lakshyata" },
  { id: "muaz", name: "Muaz" },
  { id: "aydaan", name: "Aydaan" },
  { id: "ayaan", name: "Ayaan" },
];

export const MAX_PARTICIPANTS = 10;
export const TOTAL_SHOTS = 3;

export const SHOT_PROMPTS = [
  { label: "Shot 1", cue: "Act natural & strike a classic pose.", pose: "Classic" },
  { label: "Shot 2", cue: "Give us your funniest expression.", pose: "Funny" },
  { label: "Shot 3", cue: "Strike a dramatic heart or signature pose.", pose: "Heart" },
];

export const FILTERS = [
  { id: "classic", name: "Classic", css: "grayscale(1) contrast(1.15)" },
  { id: "sepia", name: "Sepia", css: "sepia(0.75) contrast(1.05)" },
  { id: "noir", name: "Noir", css: "grayscale(1) contrast(1.4) brightness(0.9)" },
  { id: "film", name: "35mm", css: "contrast(1.1) saturate(1.15) sepia(0.15)" },
  { id: "faded", name: "Faded", css: "contrast(0.9) saturate(0.7) brightness(1.08)" },
  { id: "golden", name: "Golden", css: "sepia(0.35) saturate(1.3) brightness(1.05)" },
];

export const STRIP_THEMES = [
  { id: "classic", name: "01 — Classic" },
  { id: "royal", name: "02 — Royal" },
  { id: "film", name: "03 — Film" },
  { id: "scrapbook", name: "04 — Scrapbook" },
  { id: "editorial", name: "05 — Editorial" },
];

// How many milliseconds of lead time the host gives everyone between
// broadcasting "start this round" and the actual capture instant.
// Long enough to cover realistic realtime-channel latency + countdown UI.
export const COUNTDOWN_LEAD_MS = 3600;
