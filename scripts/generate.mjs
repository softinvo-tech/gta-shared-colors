// Generates the TypeScript and Dart color tables from colors.json.
// Usage: node scripts/generate.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const colors = JSON.parse(readFileSync(join(root, 'colors.json'), 'utf8'));

const names = new Set();
const hexes = new Set();
for (const { name, hex } of colors) {
  if (!name || typeof name !== 'string') throw new Error(`Invalid name: ${JSON.stringify(name)}`);
  if (!/^#[0-9A-F]{6}$/.test(hex)) throw new Error(`"${name}": hex must be uppercase #RRGGBB, got ${hex}`);
  if (names.has(name.toLowerCase())) throw new Error(`Duplicate name: ${name}`);
  if (hexes.has(hex)) throw new Error(`Duplicate hex ${hex} (${name})`);
  names.add(name.toLowerCase());
  hexes.add(hex);
}

const banner = 'GENERATED FILE - DO NOT EDIT. Edit colors.json and run `npm run generate`.';

const ts = `// ${banner}

export interface GtaColor {
  readonly name: string;
  /** Uppercase, with leading #, e.g. "#000080". */
  readonly hex: string;
}

export const GTA_COLORS: readonly GtaColor[] = [
${colors.map((c) => `  { name: '${c.name}', hex: '${c.hex}' },`).join('\n')}
];
`;

const dart = `// ${banner}

import '../gta_color.dart';

const List<GtaColor> gtaColors = [
${colors.map((c) => `  GtaColor('${c.name}', '${c.hex}', 0xFF${c.hex.slice(1)}),`).join('\n')}
];
`;

const out = (rel, content) => {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log(`wrote ${rel} (${colors.length} colors)`);
};

out('ts/src/colorData.ts', ts);
out('dart/lib/src/color_data.dart', dart);
