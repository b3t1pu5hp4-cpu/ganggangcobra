const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion

export function generateRoomCode(prefix = "COBRA") {
  let suffix = "";
  for (let i = 0; i < 1; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  const digit = Math.floor(Math.random() * 9) + 1;
  return `${prefix}${digit}${suffix}`;
}

export function normalizeRoomCode(input) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}
