const MEMBERS_LIST = [
  { id: "tehniyet", name: "Tehniyet" },
  { id: "zyna", name: "Zyna" },
  { id: "lakshyata", name: "Lakshyata" },
  { id: "muaz", name: "Muaz" },
  { id: "aydaan", name: "Aydaan" },
  { id: "ayaan", name: "Ayaan" },
];

const CELL_W = 120;
const CELL_H = 160;
const GUTTER = 6;
const PAD = 14;
const HEADER_H = 26;
const FOOTER_H = 38;

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

export async function compositeStrip(participantIds, shotUrlsByParticipant = {}, options = {}) {
  const numCols = 6;
  const numRows = 3;

  const width = PAD * 2 + CELL_W * numCols + GUTTER * (numCols - 1);
  const height = PAD * 2 + HEADER_H + CELL_H * numRows + GUTTER * (numRows - 1) + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const theme = options.theme || "classic";
  if (theme === "royal") {
    ctx.fillStyle = "#161311";
  } else if (theme === "film") {
    ctx.fillStyle = "#EDE3D0";
  } else {
    ctx.fillStyle = "#F5EDE0";
  }
  ctx.fillRect(0, 0, width, height);

  if (theme === "royal") {
    ctx.strokeStyle = "#C5A059";
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, width - 10, height - 10);
  }

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

  const activePIds = Array.isArray(participantIds) ? participantIds : [];

  for (let c = 0; c < numCols; c++) {
    const colX = PAD + c * (CELL_W + GUTTER);
    const member = MEMBERS_LIST[c];
    
    // Check if participant matched or fallback to user slots
    const pId = activePIds[c] || member.id;
    const urls = (shotUrlsByParticipant && (shotUrlsByParticipant[pId] || shotUrlsByParticipant[member.id])) || (c === 0 ? Object.values(shotUrlsByParticipant || {})[0] : null);

    // Column Member Name Header
    ctx.fillStyle = theme === "royal" ? "#C5A059" : "rgba(35, 27, 22, 0.85)";
    ctx.font = "700 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(member.name.toUpperCase(), colX + CELL_W / 2, PAD + 16);

    for (let r = 0; r < numRows; r++) {
      const rowY = PAD + HEADER_H + r * (CELL_H + GUTTER);
      const url = urls && Array.isArray(urls) ? urls[r] : null;
      const img = url ? cache.get(url) : null;

      if (img) {
        drawCoverImage(ctx, img, colX, rowY, CELL_W, CELL_H);
      } else {
        ctx.fillStyle = theme === "royal" ? "#0a0908" : "#191512";
        ctx.fillRect(colX, rowY, CELL_W, CELL_H);
      }
    }
  }

  ctx.fillStyle = theme === "royal" ? "#C5A059" : "rgba(35, 27, 22, 0.85)";
  ctx.font = "700 15px monospace";
  ctx.textAlign = "center";
  ctx.fillText("GANG COBRA - 2026", width / 2, height - FOOTER_H / 2 + 6);

  return canvas.toDataURL("image/png");
}
