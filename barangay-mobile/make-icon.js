// Gawa ng 1024x1024 app icon: orange gradient + white barangay hall glyph
// Pure Node (walang dependencies) — zlib PNG encoder
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const S = 1024; // size
const buf = Buffer.alloc(S * (S * 4 + 1)); // bawat row: 1 filter byte + RGBA

// Gradient: #f97316 (tuktok) -> #c2410c (ibaba)
const top = [249, 115, 22];
const bot = [194, 65, 12];

const px = (x, y, r, g, b, a = 255) => {
  if (x < 0 || y < 0 || x >= S || y >= S) return;
  const off = y * (S * 4 + 1) + 1 + x * 4;
  buf[off] = r; buf[off + 1] = g; buf[off + 2] = b; buf[off + 3] = a;
};

const roundRect = (x0, y0, x1, y1, rad) => {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      // rounded corners check
      const cx = Math.max(x0 + rad, Math.min(x, x1 - rad));
      const cy = Math.max(y0 + rad, Math.min(y, y1 - rad));
      const dx = x - cx, dy = y - cy;
      if (x >= x0 + rad && x <= x1 - rad) { px(x, y, 255, 255, 255); continue; }
      if (y >= y0 + rad && y <= y1 - rad) { px(x, y, 255, 255, 255); continue; }
      if (dx * dx + dy * dy <= rad * rad) px(x, y, 255, 255, 255);
    }
  }
};

// ---- Gradient background ----
for (let y = 0; y < S; y++) {
  const t = y / (S - 1);
  const r = Math.round(top[0] + (bot[0] - top[0]) * t);
  const g = Math.round(top[1] + (bot[1] - top[1]) * t);
  const b = Math.round(top[2] + (bot[2] - top[2]) * t);
  for (let x = 0; x < S; x++) px(x, y, r, g, b);
}

// ---- White building (barangay hall) ----
// Roof (pediment triangle)
const roofTopY = 300, roofBotY = 425, roofCx = 512, roofHalf = 250;
for (let y = roofTopY; y <= roofBotY; y++) {
  const t = (y - roofTopY) / (roofBotY - roofTopY);
  const half = Math.round(30 + (roofHalf - 30) * t);
  for (let x = roofCx - half; x <= roofCx + half; x++) px(x, y, 255, 255, 255);
}
// Body
roundRect(292, 425, 732, 724, 18);
// Pillars gaps (orange vertical lines para mukhang hall)
for (const gx of [368, 624]) {
  for (let y = 470; y <= 690; y++) for (let x = gx; x < gx + 26; x++) {
    // orange gap: kunin ang gradient color ng row
    const t = y / (S - 1);
    const r = Math.round(top[0] + (bot[0] - top[0]) * t);
    const g = Math.round(top[1] + (bot[1] - top[1]) * t);
    const b = Math.round(top[2] + (bot[2] - top[2]) * t);
    px(x, y, r, g, b);
  }
}
// Door (orange, center)
for (let y = 560; y <= 690; y++) {
  for (let x = 462; x <= 562; x++) {
    const t = y / (S - 1);
    const r = Math.round(top[0] + (bot[0] - top[0]) * t);
    const g = Math.round(top[1] + (bot[1] - top[1]) * t);
    const b = Math.round(top[2] + (bot[2] - top[2]) * t);
    px(x, y, r, g, b);
  }
}
// Steps (3 white bars sa ilalim)
for (let i = 0; i < 3; i++) {
  const y0 = 724 + i * 26;
  const inset = 60 + i * 34;
  roundRect(292 - inset + 60, y0, 732 + inset - 60, y0 + 18, 8);
}

// ---- PNG encode ----
function crc32(b) {
  let c = ~0;
  for (let i = 0; i < b.length; i++) {
    c ^= b[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(buf, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = path.join(__dirname, 'assets', 'icon.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, png);
console.log('Icon saved:', out, (png.length / 1024).toFixed(1) + ' KB');
