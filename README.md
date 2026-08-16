# Gang Cobra — Photobooth

A remote, synchronized 6×3 photobooth for up to 10 people, in the spirit of
Angie/Life4Cuts: everyone joins one room, hits ready, a shared countdown
fires the shutter for all of you at the same instant, and the individual
frames are composited into one strip.

## How the sync actually works

No video call, no continuous streaming. Just three moving parts, all on
Supabase's free tier:

1. **Presence** (`supabase.channel(...).track()`) — who's in the room and
   who's hit "I'm Ready." Every client sees the same participant list.
2. **Broadcast** — the *host* (deterministically: whoever has the
   alphabetically-first participant id, so every client agrees on who that
   is without an election process) sends a `start_round` message once
   everyone is ready, containing a single shared timestamp: `captureAt`.
   Every client counts down locally to that same wall-clock instant —
   that's what makes "3, 2, 1, FLASH" land together instead of drifting
   with each person's network latency.
3. **Storage** — at `captureAt`, each device grabs one local frame from its
   own camera, uploads that one JPEG, and broadcasts its public URL. No
   full-resolution video ever leaves anyone's device.

Once all 6 rounds are in, every client independently composites the same
set of image URLs into the final 3×6 strip on-canvas — no server render
step needed, and no image dependency issues if a participant's browser tab
is closed after the session.

**Caveat worth knowing**: this relies on participants' device clocks being
roughly in sync (true for basically every phone/laptop today via NTP). The
lead time is padded to absorb the more variable factor — realtime message
latency — but it's not laboratory-grade frame sync. For a friend-group
photobooth this reads as "same moment"; it isn't provably millisecond-exact
the way a hardwired studio rig would be.

## Setup

1. **Create a Supabase project** at supabase.com (free tier is enough).
2. **Storage** → create a bucket named `shots`, set it to **public**.
   That's the only bucket/table this app needs — there's no database
   schema, since presence and broadcast are ephemeral and don't need
   Postgres.
3. Copy `.env.example` to `.env.local` and fill in your project's URL and
   anon key (Settings → API).
4. `npm install`
5. `npm run dev` — open http://localhost:3000

## Deploy

Push to GitHub, import into Vercel, add the same two env vars in the
Vercel project settings, deploy. Camera access requires HTTPS, which
Vercel gives you by default.

## What's scaffolded vs. what's next

This covers the full room lifecycle end to end: entrance → lobby → identity
→ create/join room → ready-up → synced 6-round capture with filters →
composited 6×3 strip → download → take another strip. Dynamic column
composition (fewer people = bigger cells, more people = mini-collage per
cell) is implemented in `lib/compositeStrip.js`.

Not yet built, and worth doing as follow-ups rather than in one pass:

- **Real member photos + illustrated avatars** — currently placeholder
  monogram circles. Needs the actual photo assets dropped into
  `/public/members/` and (for the hand-drawn illustrated characters) a
  separate image-generation pass, since that's an art asset, not code.
- **Face filters** (big eyes, melting face, etc.) — needs MediaPipe Face
  Landmarker wired into the video canvas; the filter/sticker UI shell is
  in place but the landmark-driven warping isn't implemented yet.
- **Stickers** (drag/resize/rotate overlays).
- **Vintage lobby scene** (hanging photos, polaroids, strings) — the demo
  artifact from earlier has this look; it hasn't been ported into this
  codebase's `/` page yet, which currently uses a simpler centered layout.
- **Sound effects** (shutter, film advance, printer) — toggle exists,
  audio files don't yet.
- **Host handoff on disconnect** — presence will naturally reassign "host"
  to the next-lowest id if the current host's tab closes, but this hasn't
  been tested against an in-progress round.

Happy to build out any of these next — just say which.
