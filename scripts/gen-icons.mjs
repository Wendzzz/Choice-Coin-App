// Generates the PWA icon set (a simple two-circle "leaf" mark) as real PNGs,
// with a minimal hand-rolled PNG encoder (no image-library dependency).
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const iconsDir = path.join(publicDir, 'icons');
mkdirSync(iconsDir, { recursive: true });

const ACCENT = [61, 58, 110]; // #3d3a6e
const ACCENT_LIGHT = [90, 86, 150]; // lighter end of the background gradient
const WHITE = [247, 245, 240]; // leaf mark colour, matches --bg

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk('IHDR', ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = chunk('IDAT', deflateSync(raw, { level: 9 }));
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Renders the Mindleaf mark: a vertical-gradient square background with a
 * white "leaf" formed by the intersection of two circles, plus a center vein.
 * `markScale` controls how large the leaf is relative to the canvas, so the
 * maskable variant can leave extra safe-zone padding.
 */
function renderIcon(size, { markScale, squareBg }) {
  const rgba = Buffer.alloc(size * size * 4);

  const r = (size / 2) * markScale;
  const cx = size / 2;
  const cy = size / 2;
  const offset = r * 0.62; // distance of each circle's center from cx/cy
  const c1 = [cx - offset * 0.55, cy];
  const c2 = [cx + offset * 0.55, cy];

  for (let y = 0; y < size; y++) {
    const t = y / (size - 1);
    const bg = [
      Math.round(lerp(ACCENT[0], ACCENT_LIGHT[0], t)),
      Math.round(lerp(ACCENT[1], ACCENT_LIGHT[1], t)),
      Math.round(lerp(ACCENT[2], ACCENT_LIGHT[2], t)),
    ];

    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      let inBg = true;
      if (!squareBg) {
        // rounded-square mask for the "any" purpose icons
        const radius = size * 0.22;
        inBg = insideRoundedSquare(x, y, size, radius);
      }

      let color = bg;
      let alpha = inBg ? 255 : 0;

      if (inBg) {
        const d1 = Math.hypot(x - c1[0], y - c1[1]);
        const d2 = Math.hypot(x - c2[0], y - c2[1]);
        const inLeaf = d1 <= r && d2 <= r;

        if (inLeaf) {
          // thin vein down the middle of the leaf
          const nearVein = Math.abs(x - cx) < size * 0.006 && Math.abs(y - cy) < r * 0.85;
          color = nearVein ? bg : WHITE;
        }
      }

      rgba[idx] = color[0];
      rgba[idx + 1] = color[1];
      rgba[idx + 2] = color[2];
      rgba[idx + 3] = alpha;
    }
  }

  return encodePng(size, size, rgba);
}

function insideRoundedSquare(x, y, size, radius) {
  const nx = x < radius ? radius : x > size - radius ? size - radius : x;
  const ny = y < radius ? radius : y > size - radius ? size - radius : y;
  if ((x < radius || x > size - radius) && (y < radius || y > size - radius)) {
    return Math.hypot(x - nx, y - ny) <= radius;
  }
  return true;
}

writeFileSync(path.join(iconsDir, 'icon-192.png'), renderIcon(192, { markScale: 0.62, squareBg: false }));
writeFileSync(path.join(iconsDir, 'icon-512.png'), renderIcon(512, { markScale: 0.62, squareBg: false }));
writeFileSync(
  path.join(iconsDir, 'icon-maskable-512.png'),
  renderIcon(512, { markScale: 0.44, squareBg: true }),
);
writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), renderIcon(180, { markScale: 0.62, squareBg: true }));

console.log('Icons written to public/icons and public/apple-touch-icon.png');
