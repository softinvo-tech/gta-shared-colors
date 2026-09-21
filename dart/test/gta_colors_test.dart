import 'package:gta_colors/gta_colors.dart';
import 'package:test/test.dart';

void main() {
  test('normalizeHex handles common shapes', () {
    expect(GtaColors.normalizeHex('#abc'), '#AABBCC');
    expect(GtaColors.normalizeHex('aabbcc'), '#AABBCC');
    expect(GtaColors.normalizeHex(' #aAbBcC '), '#AABBCC');
    expect(GtaColors.normalizeHex('0x000080'), '#000080');
    expect(GtaColors.normalizeHex('#12345'), isNull);
    expect(GtaColors.normalizeHex('#FF000080'), isNull);
    expect(GtaColors.normalizeHex('zzzzzz'), isNull);
    expect(GtaColors.normalizeHex(''), isNull);
    expect(GtaColors.normalizeHex(null), isNull);
  });

  test('exact matches, any casing/format', () {
    expect(GtaColors.nameFromHex('#000080'), 'Navy Blue');
    expect(GtaColors.nameFromHex('000080'), 'Navy Blue');
    expect(GtaColors.nameFromHex('#fff'), 'White');
    expect(GtaColors.nameFromHex('#000'), 'Black');
  });

  test('nearest fallback for unlisted hex', () {
    expect(GtaColors.byHex('#010082'), isNull);
    expect(GtaColors.nameFromHex('#010082'), 'Navy Blue');
    expect(GtaColors.nameFromHex('#FE0101'), 'Red');
    expect(GtaColors.nameFromHex('#010082', exactOnly: true), isNull);
  });

  test('invalid hex gives null', () {
    expect(GtaColors.nameFromHex('nope'), isNull);
    expect(GtaColors.nearest(null), isNull);
  });

  test('name -> hex is case-insensitive', () {
    expect(GtaColors.hexFromName('navy blue'), '#000080');
    expect(GtaColors.hexFromName(' Navy Blue '), '#000080');
    expect(GtaColors.hexFromName('Nonexistent'), isNull);
  });

  test('argb is Flutter-ready', () {
    expect(GtaColors.byHex('#000080')!.argb, 0xFF000080);
  });

  test('every listed color resolves to itself', () {
    for (final c in gtaColors) {
      expect(GtaColors.nameFromHex(c.hex), c.name);
      expect(GtaColors.hexFromName(c.name), c.hex);
    }
  });
}
