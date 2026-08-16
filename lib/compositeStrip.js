// Builds the final 3-column x 6-row Gang Cobra strip from everyone's
// captured frames for each of the 6 rounds. Runs entirely client-side —
// every participant's browser can independently produce the same strip
// from the same set of image URLs, so no server-side render step is needed.

const CELL_W = 260;
const CELL_H = 260;
const GUTTER = 6;
const PAD = 18;
const FOOTER_H = 46;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return reject(new Error("No src provided"));
    const img = new Image();
    if (!src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

// Split participants into up to 3 balanced groups (left-to-right column order).
// 1–3 participants -> one per column (unused columns stay empty/branded).
// 4–10 participants -> chunked as evenly as possible across 3 columns, each
// column cell becomes a small collage for that round.
export function computeColumnGroups(participantIds) {
  const n = participantIds.length;
  if (n <= 3) {
    const groups = [[], [], []];
    participantIds.forEach((id, i) => groups[i].push(id));
    return groups;
  }
  const groups = [[], [], []];
  participantIds.forEach((id, i) => groups[i % 3].push(id));
  return groups;
}

function drawCoverImage(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

async function drawCellCollage(ctx, x, y, w, h, images) {
  if (images.length === 0) {
    ctx.fillStyle = "#171310";
    ctx.fillRect(x, y, w, h);
    return;
  }
  if (images.length === 1) {
    drawCoverImage(ctx, images[0], x, y, w, h);
    return;
  }
  // Tight sub-grid for 4–10 participants sharing a cell, keeping every
  // face reasonably sized rather than shrinking to an unreadable strip.
  const cols = images.length <= 2 ? images.length : 2;
  const rows = Math.ceil(images.length / cols);
  const cw = w / cols;
  const ch = h / rows;
  images.forEach((img, i) => {
    const cx = x + (i % cols) * cw;
    const cy = y + Math.floor(i / cols) * ch;
    drawCoverImage(ctx, img, cx, cy, cw - 1, ch - 1);
  });
}

/**
 * @param {string[]} participantIds - stable seat order for this session
 * @param {Record<string, string[]>} shotUrlsByParticipant - id -> [url round0..5]
 * @param {{ theme?: string }} options
 * @returns {Promise<string>} PNG data URL of the finished strip
 */
export async function compositeStrip(participantIds, shotUrlsByParticipant, options = {}) {
  const rounds = 6;
  const groups = computeColumnGroups(participantIds);

  const width = PAD * 2 + CELL_W * 3 + GUTTER * 2;
  const height = PAD * 2 + CELL_H * rounds + GUTTER * (rounds - 1) + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const paperColor = options.theme === "film" ? "#EDE3D0" : "#F1E9DA";
  ctx.fillStyle = paperColor;
  ctx.fillRect(0, 0, width, height);

  if (options.theme === "royal") {
    ctx.strokeStyle = "#A9824C";
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, width - 12, height - 12);
  }

  // Pre-load every image referenced across all rounds.
  const cache = new Map();
  const allUrls = new Set();
  Object.values(shotUrlsByParticipant).forEach((arr) => arr?.forEach((u) => u && allUrls.add(u)));
  await Promise.all(
    [...allUrls].map(async (u) => {
      try {
        cache.set(u, await loadImage(u));
      } catch {
        /* skip missing/broken frames rather than failing the whole strip */
      }
    })
  );

  for (let round = 0; round < rounds; round++) {
    const rowY = PAD + round * (CELL_H + GUTTER);
    for (let col = 0; col < 3; col++) {
      const colX = PAD + col * (CELL_W + GUTTER);
      const memberIds = groups[col];
      const images = memberIds
        .map((id) => shotUrlsByParticipant[id]?.[round])
        .filter(Boolean)
        .map((u) => cache.get(u))
        .filter(Boolean);
      await drawCellCollage(ctx, colX, rowY, CELL_W, CELL_H, images);

      if (options.theme === "film") {
        ctx.fillStyle = "rgba(20,15,10,0.08)";
        ctx.fillRect(colX, rowY, CELL_W, CELL_H);
      }
    }
  }

  ctx.fillStyle = "rgba(27,21,18,0.6)";
  ctx.font = "700 16px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText("GANG COBRA · 2026", width / 2, height - FOOTER_H / 2 + 6);

  return canvas.toDataURL("image/png");
}
