import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GTA_COLORS,
  normalizeHex,
  getColorName,
  getColorHex,
  getColorByHex,
  findNearestColor,
} from '../src/index';

test('normalizeHex handles common shapes', () => {
  assert.equal(normalizeHex('#abc'), '#AABBCC');
  assert.equal(normalizeHex('aabbcc'), '#AABBCC');
  assert.equal(normalizeHex(' #aAbBcC '), '#AABBCC');
  assert.equal(normalizeHex('0x000080'), '#000080');
  assert.equal(normalizeHex('#12345'), null);
  assert.equal(normalizeHex('#FF000080'), null);
  assert.equal(normalizeHex('zzzzzz'), null);
  assert.equal(normalizeHex(''), null);
  assert.equal(normalizeHex(null), null);
});

test('exact matches, any casing/format', () => {
  assert.equal(getColorName('#000080'), 'Navy Blue');
  assert.equal(getColorName('000080'), 'Navy Blue');
  assert.equal(getColorName('#fff'), 'White');
  assert.equal(getColorName('#000'), 'Black');
});

test('nearest fallback for unlisted hex', () => {
  assert.equal(getColorByHex('#010082'), undefined);
  assert.equal(getColorName('#010082'), 'Navy Blue');
  assert.equal(getColorName('#FE0101'), 'Red');
  assert.equal(getColorName('#010082', { exactOnly: true }), null);
});

test('invalid hex gives null', () => {
  assert.equal(getColorName('nope'), null);
  assert.equal(findNearestColor(undefined), null);
});

test('name -> hex is case-insensitive', () => {
  assert.equal(getColorHex('navy blue'), '#000080');
  assert.equal(getColorHex(' Navy Blue '), '#000080');
  assert.equal(getColorHex('Nonexistent'), undefined);
});

test('every listed color resolves to itself', () => {
  for (const c of GTA_COLORS) {
    assert.equal(getColorName(c.hex), c.name);
    assert.equal(getColorHex(c.name), c.hex);
  }
});
