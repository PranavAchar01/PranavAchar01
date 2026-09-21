// 2D pixel icons in the Scrutineer palette: 4-step ramps, 8x8 Bayer dither, hard 1px ink outline,
// a dithered drop shadow at (+1, +2). Every icon is drawn in the same 40x40 design space and rasterized
// into the same 36x36 pixel square, centred in the same 64x44 art area, so all tiles match exactly.
const AW = 64, AH = 44, SCALE = 6, IS = 36, IX = (AW - IS) / 2, IY = (AH - IS) / 2, K = IS / 40;
const BAYER = [
  0,32,8,40,2,34,10,42, 48,16,56,24,50,18,58,26, 12,44,4,36,14,46,6,38, 60,28,52,20,62,30,54,22,
  3,35,11,43,1,33,9,41, 51,19,59,27,49,17,57,25, 15,47,7,39,13,45,5,37, 63,31,55,23,61,29,53,21];
const bayer = (x, y) => (BAYER[((y & 7) << 3) | (x & 7)] + 0.5) / 64;
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const RAMP = {
  BODY:   ['#6A6F8A', '#C8CBD8', '#FFFFFF', '#FFFFFF'],
  STRIPE: ['#5E0C13', '#A5161F', '#E31E2D', '#FF5A63'],
  CARBON: ['#000000', '#14161E', '#2C2E3A', '#474A5A'],
  TYRE:   ['#000000', '#0B0B10', '#1A1A22', '#2C2E3A'],
  RIM:    ['#2C2E3A', '#6A6F8A', '#C8CBD8', '#FFFFFF'],
  GOLD:   ['#7A5F14', '#B8922C', '#F4C542', '#FFE08A'],
  CYAN:   ['#0E4A5E', '#1F8FB0', '#3DD2FF', '#B8F0FF'],
  LAMP:   ['#B8F0FF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
  WARM:   ['#B8922C', '#F4C542', '#FFE08A', '#FFFFFF'],
  GREEN:  ['#0B4A22', '#1C8C44', '#2FD968', '#A8F5C4'],
  AMBER:  ['#6B3D00', '#B86A0A', '#FFA318', '#FFD28A'],
  PURPLE: ['#3A0E5E', '#6E24A8', '#B24CFF', '#E0B8FF'],
  BLUE:   ['#0A2A5E', '#1E5AB0', '#3D8BFF', '#B8D4FF'],
};
const RAMPS = {}; for (const k in RAMP) RAMPS[k] = RAMP[k].map(hex);
const NIGHT = hex('#06081A'), STUDIO = hex('#121A4A'), INK = [0, 0, 0];

// ---- shapes: each has inside(u, v) in design space, a bbox, a material, and a shading model ----
let SH = [];
const add = s => (SH.push(s), s);
function rect(x, y, w, h, m, o = {}) { return add({ m, ...o, bb: [x, y, x + w, y + h], inside: (u, v) => u >= x && u < x + w && v >= y && v < y + h }); }
function circle(cx, cy, r, m, o = {}) { return add({ m, ...o, round: [cx, cy, r], bb: [cx - r, cy - r, cx + r, cy + r], inside: (u, v) => (u - cx) ** 2 + (v - cy) ** 2 <= r * r }); }
function arc(cx, cy, r0, r1, a0, a1, m, o = {}) {
  return add({ m, ...o, bb: [cx - r1, cy - r1, cx + r1, cy + r1], inside: (u, v) => {
    const d = Math.hypot(u - cx, v - cy); if (d < r0 || d > r1) return false;
    const a = Math.atan2(v - cy, u - cx) * 180 / Math.PI; return a >= a0 && a <= a1; } });
}
function line(x0, y0, x1, y1, t, m, o = {}) {
  const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
  return add({ m, ...o, bb: [Math.min(x0, x1) - t, Math.min(y0, y1) - t, Math.max(x0, x1) + t, Math.max(y0, y1) + t], inside: (u, v) => {
    const k = Math.max(0, Math.min(1, ((u - x0) * dx + (v - y0) * dy) / L2)); return Math.hypot(u - x0 - k * dx, v - y0 - k * dy) <= t / 2; } });
}
function poly(pts, m, o = {}) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return add({ m, ...o, bb: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], inside: (u, v) => {
    let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > v) !== (yj > v) && u < (xj - xi) * (v - yi) / (yj - yi) + xi) c = !c; }
    return c; } });
}
function shadeAt(s, u, v) {
  if (s.flat !== undefined) return s.flat;
  if (s.round) {   // lit like a ball, key light from the upper left
    const [cx, cy, r] = s.round, nx = (u - cx) / r, ny = (v - cy) / r;
    return Math.max(0, Math.min(1, 0.62 - 0.42 * (nx * 0.6 + ny * 0.8) - 0.12 * (nx * nx + ny * ny)));
  }
  const [x0, y0, x1, y1] = s.bb, t = ((u - x0) / Math.max(1, x1 - x0) + (v - y0) / Math.max(1, y1 - y0)) / 2;
  return Math.max(0, Math.min(1, 0.98 - 0.6 * t));
}

const ICONS = {
  'player-two'() {
    rect(6, 34, 18, 4, 'CARBON'); rect(10, 28, 10, 6, 'BODY');
    line(15, 28, 22, 13, 5, 'BODY'); line(22, 13, 32, 19, 4, 'BODY');
    line(17, 24, 21, 16, 1.4, 'STRIPE', { flat: 0.7 });
    circle(15, 28, 3, 'GOLD'); circle(22, 13, 3, 'GOLD');
    line(32, 19, 33, 25, 1.8, 'CARBON'); line(32, 19, 37, 22, 1.8, 'CARBON');
    rect(30, 29, 7, 7, 'CYAN', { ink: true });
  },
  sixthsense() {
    rect(5, 5, 14, 30, 'CARBON'); rect(7, 8, 10, 23, 'CYAN'); rect(10, 6, 4, 1, 'CARBON', { flat: 0.2 });
    for (const [r0, r1] of [[5, 7.5], [10, 12.5], [15, 17.5]]) arc(19, 20, r0, r1, -55, 55, 'PURPLE');
  },
  foundry() {
    rect(3, 20, 34, 16, 'BODY');
    for (let i = 0; i < 3; i++) poly([[3 + i * 9, 20], [12 + i * 9, 20], [12 + i * 9, 12]], i === 1 ? 'GOLD' : 'CARBON');
    rect(30, 5, 5, 15, 'STRIPE'); rect(29, 5, 7, 2, 'GOLD');
    for (let i = 0; i < 4; i++) rect(6 + i * 7, 24, 4, 4, 'CYAN', { flat: 0.6 });
    rect(17, 30, 5, 6, 'GOLD');
  },
  healthflow() {
    rect(2, 11, 25, 20, 'BODY'); poly([[27, 15], [34, 15], [38, 22], [38, 31], [27, 31]], 'BODY');
    rect(29, 17, 6, 5, 'CYAN', { flat: 0.65 }); rect(2, 23, 36, 3, 'STRIPE', { flat: 0.7 });
    rect(12, 13, 4, 10, 'STRIPE'); rect(9, 16, 10, 4, 'STRIPE');
    rect(7, 8, 5, 3, 'STRIPE'); rect(13, 8, 5, 3, 'CYAN');
    for (const x of [10, 31]) { circle(x, 32, 4.5, 'TYRE', { ink: true }); circle(x, 32, 1.8, 'RIM'); }
  },
  vigil() {
    rect(9, 36, 22, 3, 'CARBON');
    const band = (y0, y1, m) => { const w0 = 6.5 - (36 - y0) * 0.1, w1 = 6.5 - (36 - y1) * 0.1; poly([[20 - w1, y1], [20 + w1, y1], [20 + w0, y0], [20 - w0, y0]], m); };
    const ys = [36, 31, 26, 21, 16, 12]; for (let i = 0; i < 5; i++) band(ys[i], ys[i + 1], (i & 1) ? 'BODY' : 'STRIPE');
    rect(13, 10, 14, 2, 'CARBON'); rect(16, 5, 8, 5, 'LAMP'); poly([[15, 5], [25, 5], [20, 1]], 'CARBON');
    poly([[24, 6], [39, 3], [39, 10], [24, 9]], 'LAMP', { flat: 0.9 });
  },
  seefu() {        // a plate under inspection, with a check
    circle(20, 22, 15, 'BODY', { ink: true }); circle(20, 22, 10.5, 'RIM');
    circle(15, 20, 3, 'GREEN'); circle(23, 18, 2.5, 'STRIPE'); circle(22, 26, 3, 'GOLD');
    circle(33, 8, 6, 'CYAN', { ink: true });
    line(30, 8, 32.5, 10.5, 1.6, 'BODY', { flat: 0.95 }); line(32.5, 10.5, 36.5, 5.5, 1.6, 'BODY', { flat: 0.95 });
  },
  reasoning() {
    [[3, 30, 8], [12, 24, 14], [21, 18, 20], [30, 12, 26]].forEach(([x, y, h], i) => {
      rect(x, y, 8, h, 'BODY', { ink: true }); rect(x, y, 8, 2, i === 3 ? 'GOLD' : 'CYAN', { flat: 0.75 }); });
    circle(34, 7, 3.5, 'STRIPE', { ink: true });
  },
  'open-source'() {
    line(3, 27, 37, 27, 3, 'CARBON', { flat: 0.6 });
    line(10, 27, 15, 14, 2.4, 'CARBON', { flat: 0.6 }); line(15, 14, 26, 14, 2.4, 'CARBON', { flat: 0.6 }); line(26, 14, 31, 27, 2.4, 'CARBON', { flat: 0.6 });
    for (const x of [5, 10, 31, 36]) circle(x, 27, 3.6, 'BODY', { ink: true });
    for (const x of [15, 26]) circle(x, 14, 3.6, 'GREEN', { ink: true });
  },
  guardianeye() {
    rect(18.5, 19, 3, 17, 'CARBON'); rect(13, 36, 14, 3, 'CARBON');
    rect(6, 3, 28, 17, 'CARBON'); rect(6, 3, 28, 1.5, 'AMBER', { flat: 0.7 }); rect(6, 18.5, 28, 1.5, 'AMBER', { flat: 0.5 });
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) rect(8.5 + c * 8.3, 6 + r * 6.3, 6.5, 5, 'LAMP');
  },
  osteon() {
    for (const [x, y] of [[7, 15], [7, 25], [33, 15], [33, 25]]) circle(x, y, 5, 'BODY');
    rect(7, 16, 26, 8, 'BODY');
    rect(13, 14, 14, 2.5, 'GOLD', { flat: 0.8 });
    for (let i = 0; i < 4; i++) rect(14 + i * 3.4, 14.5, 1.5, 1.5, 'RIM', { flat: 0.2 });
  },
  scrutineer() {   // the Gen 22 car, side view
    rect(3, 28, 34, 2, 'CARBON');
    poly([[5, 28], [37, 28], [38, 25], [30, 23], [23, 19], [13, 19], [9, 22], [5, 23]], 'BODY');
    poly([[13, 19], [18, 13], [24, 19]], 'BODY');
    rect(9, 23, 26, 2, 'STRIPE', { flat: 0.7 });
    rect(2, 12, 7, 2.5, 'CARBON'); rect(2, 12, 2, 12, 'CARBON'); rect(4, 15, 5, 1.5, 'STRIPE', { flat: 0.7 });
    rect(33, 27, 6, 2, 'STRIPE', { flat: 0.7 });
    line(16, 17, 23, 17, 1.2, 'CARBON', { flat: 0.3 }); circle(19.5, 17.5, 2.4, 'GOLD');
    for (const x of [11, 31]) { circle(x, 29, 5, 'TYRE', { ink: true }); circle(x, 29, 2.2, 'RIM'); circle(x, 29, 0.9, 'GOLD'); }
  },
  sightline() {
    rect(3, 5, 34, 22, 'CARBON'); rect(5, 7, 30, 18, 'CYAN');
    [3, 6, 10, 7, 12, 8, 5, 9, 4].forEach((h, i) => rect(8.5 + i * 2.8, 16 - h / 2, 1.6, h, 'BODY', { flat: 0.95 }));
    rect(18, 27, 4, 6, 'CARBON'); rect(11, 33, 18, 3, 'PURPLE');
  },
  lumen() {
    circle(20, 15, 12, 'WARM'); rect(15, 23, 10, 5, 'WARM');
    line(16.5, 19, 20, 12, 1, 'GOLD', { flat: 0.3 }); line(20, 12, 23.5, 19, 1, 'GOLD', { flat: 0.3 });
    rect(14.5, 28, 11, 2, 'GOLD'); rect(14.5, 30, 11, 2, 'RIM'); rect(14.5, 32, 11, 2, 'GOLD');
    rect(17.5, 34, 5, 2.5, 'CARBON');
  },
  resume() {
    rect(12, 3, 23, 31, 'RIM', { ink: true });
    rect(7, 6, 23, 31, 'BODY', { ink: true });
    rect(10, 9, 12, 2, 'STRIPE', { flat: 0.7 });
    [14, 17, 20, 23, 26].forEach((y, i) => rect(10, y, 16 - (i % 3) * 3, 1.2, 'CARBON', { flat: 0.3 }));
    circle(25, 32, 3, 'GOLD', { ink: true });
  },
  website() {
    arc(20, 18, 14.5, 16, -70, 200, 'GOLD');
    const globe = circle(20, 18, 13, 'CYAN');
    for (const [x, y, r] of [[15, 12, 4], [11, 16, 3.5], [24, 22, 5], [27, 14, 2.5], [18, 27, 3]]) {
      add({ m: 'GREEN', round: [20, 18, 13], bb: [x - r, y - r, x + r, y + r], inside: (u, v) => (u - x) ** 2 + (v - y) ** 2 <= r * r && globe.inside(u, v) });
    }
    rect(18.5, 31, 3, 4, 'CARBON'); rect(12, 35, 16, 3, 'GOLD');
  },
  linkedin() {
    poly([[7, 3], [33, 3], [37, 7], [37, 33], [33, 37], [7, 37], [3, 33], [3, 7]], 'BLUE');
    rect(9, 16, 5, 15, 'BODY', { flat: 0.95 }); rect(9, 9, 5, 5, 'BODY', { flat: 0.95 });
    rect(17, 16, 5, 15, 'BODY', { flat: 0.95 }); rect(26, 19, 5, 12, 'BODY', { flat: 0.95 });
    poly([[17, 16], [27, 16], [31, 19], [31, 21], [22, 21], [22, 19]], 'BODY', { flat: 0.95 });
  },
};

function renderIcon(slug, canvas) {
  SH = []; ICONS[slug]();
  const px = new Uint8ClampedArray(AW * AH * 4), id = new Int16Array(AW * AH).fill(-1);
  const put = (x, y, c) => { const o = (y * AW + x) * 4; px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; px[o + 3] = 255; };
  for (let y = 0; y < AH; y++) for (let x = 0; x < AW; x++) put(x, y, Math.min(1, Math.max(0, (y - 4) / 30)) > bayer(x, y) ? STUDIO : NIGHT);
  // rasterize shapes into the icon square: sample each pixel centre in design space
  const shadeBuf = new Float32Array(AW * AH);
  SH.forEach((s, si) => {
    const [bx0, by0, bx1, by1] = s.bb;
    const x0 = Math.max(0, Math.floor(bx0 * K)), x1 = Math.min(IS - 1, Math.ceil(bx1 * K)), y0 = Math.max(0, Math.floor(by0 * K)), y1 = Math.min(IS - 1, Math.ceil(by1 * K));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const u = (x + 0.5) / K, v = (y + 0.5) / K;
      if (!s.inside(u, v)) continue;
      const i = (y + IY) * AW + (x + IX); id[i] = si; shadeBuf[i] = shadeAt(s, u, v);
    }
  });
  const mask = i => id[i] >= 0;
  // drop shadow: mask offset (+1, +2) through a 50% checker, onto the backdrop only
  for (let y = 0; y < AH; y++) for (let x = 0; x < AW; x++) {
    const sx = x - 1, sy = y - 2, i = y * AW + x;
    if (sx < 0 || sy < 0 || mask(i) || !mask(sy * AW + sx)) continue;
    if ((x + y) & 1) put(x, y, INK);
  }
  // fill shapes with dithered ramps
  for (let y = 0; y < AH; y++) for (let x = 0; x < AW; x++) {
    const i = y * AW + x; if (!mask(i)) continue;
    const ramp = RAMPS[SH[id[i]].m], s = shadeBuf[i] * 3, s0 = Math.floor(s), fr = s - s0;
    put(x, y, ramp[Math.min(3, fr > bayer(x, y) ? s0 + 1 : s0)]);
  }
  // ink: 1px outline around the whole icon, plus around shapes that ask for their own edge
  const out = [];
  for (let y = 0; y < AH; y++) for (let x = 0; x < AW; x++) {
    const i = y * AW + x, me = id[i];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= AW || ny >= AH) continue;
      const nb = id[ny * AW + nx];
      if (me < 0 && nb >= 0) { out.push([x, y]); break; }
      if (me >= 0 && nb > me && SH[nb].ink) { out.push([x, y]); break; }
    }
  }
  for (const [x, y] of out) put(x, y, INK);
  const off = document.createElement('canvas'); off.width = AW; off.height = AH;
  off.getContext('2d').putImageData(new ImageData(px, AW, AH), 0, 0);
  canvas.width = AW * SCALE; canvas.height = AH * SCALE;
  const ctx = canvas.getContext('2d', { alpha: false }); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, AW * SCALE, AH * SCALE);
}
