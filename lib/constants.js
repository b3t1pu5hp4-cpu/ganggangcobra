export const MEMBERS = [
  { id: "tehniyet", name: "Tehniyet" },
  { id: "zyna", name: "Zyna" },
  { id: "lakshyata", name: "Lakshyata" },
  { id: "muaz", name: "Muaz" },
  { id: "aydaan", name: "Aydaan" },
  { id: "ayaan", name: "Ayaan" },
];

export const MAX_PARTICIPANTS = 10;
export const TOTAL_SHOTS = 6;

export const SHOT_PROMPTS = [
  { label: "Shot 1", cue: "Act normal.", pose: "Classic" },
  { label: "Shot 2", cue: "Okay, now be weird.", pose: "Funny" },
  { label: "Shot 3", cue: "Everyone look left.", pose: "Look away" },
  { label: "Shot 4", cue: "Hands on hearts.", pose: "Heart" },
  { label: "Shot 5", cue: "Lose it completely.", pose: "Chaotic" },
  { label: "Shot 6", cue: "One last dramatic one.", pose: "Cinematic" },
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
