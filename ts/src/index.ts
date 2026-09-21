import { GTA_COLORS, type GtaColor } from './colorData';

export { GTA_COLORS };
export type { GtaColor };

/**
 * Normalizes user/DB input to "#RRGGBB" (uppercase).
 * Accepts "#abc", "abc", "#AABBCC", "aabbcc", "0xAABBCC" (surrounding whitespace ok).
 * Returns null for anything else (including 8-digit values with alpha).
 */
export function normalizeHex(input: string | null | undefined): string | null {
  if (!input) return null;
  let h = input.trim().toUpperCase();
  if (h.startsWith('0X')) h = h.slice(2);
  else if (h.startsWith('#')) h = h.slice(1);
  if (/^[0-9A-F]{3}$/.test(h)) h = h.split('').map((c) => c + c).join('');
  return /^[0-9A-F]{6}$/.test(h) ? `#${h}` : null;
}

type Lab = readonly [number, number, number];

function hexToLab(hex: string): Lab {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = lin(parseInt(hex.slice(1, 3), 16));
  const g = lin(parseInt(hex.slice(3, 5), 16));
  const b = lin(parseInt(hex.slice(5, 7), 16));
  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

// Perceptual (CIE Lab) distance so "nearest" matches what the eye sees, not raw RGB.
const labTable = GTA_COLORS.map((color) => ({ color, lab: hexToLab(color.hex) }));
const byHex = new Map(GTA_COLORS.map((c) => [c.hex, c]));
const byName = new Map(GTA_COLORS.map((c) => [c.name.toLowerCase(), c]));

/** Exact match only. */
export function getColorByHex(hex: string | null | undefined): GtaColor | undefined {
  const n = normalizeHex(hex);
  return n ? byHex.get(n) : undefined;
}

/** Closest named color to any valid hex. Returns null if the hex is invalid. */
export function findNearestColor(hex: string | null | undefined): GtaColor | null {
  const n = normalizeHex(hex);
  if (!n) return null;
  const exact = byHex.get(n);
  if (exact) return exact;
  const [l, a, b] = hexToLab(n);
  let best = labTable[0];
  let bestD = Infinity;
  for (const entry of labTable) {
    const d = (entry.lab[0] - l) ** 2 + (entry.lab[1] - a) ** 2 + (entry.lab[2] - b) ** 2;
    if (d < bestD) {
      bestD = d;
      best = entry;
    }
  }
  return best.color;
}

/**
 * Name for a hex from the DB.
 * Default: nearest named color (so any picker value gets a name).
 * With `{ exactOnly: true }`: only listed colors, otherwise null.
 * Returns null for an invalid hex.
 */
export function getColorName(
  hex: string | null | undefined,
  options: { exactOnly?: boolean } = {},
): string | null {
  const color = options.exactOnly ? getColorByHex(hex) : findNearestColor(hex);
  return color?.name ?? null;
}

/** Hex ("#RRGGBB") for a color name, case-insensitive. Undefined if unknown. */
export function getColorHex(name: string | null | undefined): string | undefined {
  return name ? byName.get(name.trim().toLowerCase())?.hex : undefined;
}
