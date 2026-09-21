import 'dart:math' as math;

import 'gta_color.dart';
import 'src/color_data.dart';

export 'gta_color.dart';
export 'src/color_data.dart' show gtaColors;

/// Hex <-> color name lookups shared with the TypeScript package.
abstract final class GtaColors {
  /// Normalizes to "#RRGGBB" (uppercase).
  /// Accepts "#abc", "abc", "#AABBCC", "aabbcc", "0xAABBCC".
  /// Returns null for anything else (including 8-digit values with alpha).
  static String? normalizeHex(String? input) {
    if (input == null) return null;
    var h = input.trim().toUpperCase();
    if (h.startsWith('0X')) {
      h = h.substring(2);
    } else if (h.startsWith('#')) {
      h = h.substring(1);
    }
    if (RegExp(r'^[0-9A-F]{3}$').hasMatch(h)) {
      h = h.split('').map((c) => '$c$c').join();
    }
    return RegExp(r'^[0-9A-F]{6}$').hasMatch(h) ? '#$h' : null;
  }

  static final Map<String, GtaColor> _byHex = {for (final c in gtaColors) c.hex: c};
  static final Map<String, GtaColor> _byName = {
    for (final c in gtaColors) c.name.toLowerCase(): c,
  };
  static final List<List<double>> _labs = [for (final c in gtaColors) _hexToLab(c.hex)];

  /// Exact match only.
  static GtaColor? byHex(String? hex) {
    final n = normalizeHex(hex);
    return n == null ? null : _byHex[n];
  }

  /// Closest named color to any valid hex, or null if the hex is invalid.
  static GtaColor? nearest(String? hex) {
    final n = normalizeHex(hex);
    if (n == null) return null;
    final exact = _byHex[n];
    if (exact != null) return exact;
    final lab = _hexToLab(n);
    var best = 0;
    var bestD = double.infinity;
    for (var i = 0; i < _labs.length; i++) {
      final d = math.pow(_labs[i][0] - lab[0], 2) +
          math.pow(_labs[i][1] - lab[1], 2) +
          math.pow(_labs[i][2] - lab[2], 2);
      if (d < bestD) {
        bestD = d.toDouble();
        best = i;
      }
    }
    return gtaColors[best];
  }

  /// Name for a hex from the DB.
  /// Default: nearest named color. With [exactOnly]: listed colors only.
  /// Returns null for an invalid hex.
  static String? nameFromHex(String? hex, {bool exactOnly = false}) =>
      (exactOnly ? byHex(hex) : nearest(hex))?.name;

  /// Hex ("#RRGGBB") for a color name, case-insensitive. Null if unknown.
  static String? hexFromName(String? name) =>
      name == null ? null : _byName[name.trim().toLowerCase()]?.hex;

  // Perceptual (CIE Lab) distance so "nearest" matches what the eye sees.
  static List<double> _hexToLab(String hex) {
    double lin(int v) {
      final c = v / 255;
      return c <= 0.04045 ? c / 12.92 : math.pow((c + 0.055) / 1.055, 2.4).toDouble();
    }

    final r = lin(int.parse(hex.substring(1, 3), radix: 16));
    final g = lin(int.parse(hex.substring(3, 5), radix: 16));
    final b = lin(int.parse(hex.substring(5, 7), radix: 16));
    final x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
    final y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
    final z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883;
    double f(double t) =>
        t > 216 / 24389 ? math.pow(t, 1 / 3).toDouble() : ((24389 / 27) * t + 16) / 116;
    return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
  }
}
