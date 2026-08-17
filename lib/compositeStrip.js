const CELL_W = 120;
const CELL_H = 160;
const GUTTER = 6;
const PAD = 14;
const FOOTER_H = 40;

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    if (!src.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawCoverImage(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

export async function compositeStrip(participantIds, shotUrlsByParticipant, options = {}) {
  const numCols = 6;
  const numRows = 3;

  const width = PAD * 2 + CELL_W * numCols + GUTTER * (numCols - 1);
  const height = PAD * 2 + CELL_H * numRows + GUTTER * (numRows - 1) + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Background
  const paperColor = options.theme === "film" ? "#EDE3D0" : options.theme === "royal" ? "#191513" : "#F4EDE2";
  ctx.fillStyle = paperColor;
  ctx.fillRect(0, 0, width, height);

  if (options.theme === "royal") {
    ctx.strokeStyle = "#C5A059";
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, width - 8, height - 8);
  }

  // Pre-load all available shot URLs
  const cache = new Map();
  const allUrls = new Set();
  Object.values(shotUrlsByParticipant || {}).forEach((arr) => {
    if (Array.isArray(arr)) arr.forEach((u) => u && allUrls.add(u));
  });

  await Promise.all(
    [...allUrls].map(async (u) => {
      const img = await loadImage(u);
      if (img) cache.set(u, img);
    })
  );

  const pList = Array.isArray(participantIds) ? participantIds : [];

  for (let c = 0; c < numCols; c++) {
    const colX = PAD + c * (CELL_W + GUTTER);
    const pId = pList[c];

    for (let r = 0; r < numRows; r++) {
      const rowY = PAD + r * (CELL_H + GUTTER);
      const url = pId && shotUrlsByParticipant && shotUrlsByParticipant[pId] ? shotUrlsByParticipant[pId][r] : null;
      const img = url ? cache.get(url) : null;

      if (img) {
        drawCoverImage(ctx, img, colX, rowY, CELL_W, CELL_H);
      } else {
        ctx.fillStyle = options.theme === "royal" ? "#0d0c0b" : "#171310";
        ctx.fillRect(colX, rowY, CELL_W, CELL_H);
      }

      if (options.theme === "film") {
        ctx.fillStyle = "rgba(20,15,10,0.06)";
        ctx.fillRect(colX, rowY, CELL_W, CELL_H);
      }
    }
  }

  ctx.fillStyle = options.theme === "royal" ? "#C5A059" : "rgba(27,21,18,0.75)";
  ctx.font = "700 13px monospace";
  ctx.textAlign = "center";
  ctx.letterSpacing = "3px";
  ctx.fillText("GANG COBRA - 2026", width / 2, height - FOOTER_H / 2 + 5);

  return canvas.toDataURL("image/png");
}
