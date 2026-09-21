/// A named color. Pure Dart (no Flutter import) so it works everywhere.
///
/// In Flutter: `Color(gtaColor.argb)`.
class GtaColor {
  const GtaColor(this.name, this.hex, this.argb);

  final String name;

  /// Uppercase with leading #, e.g. "#000080".
  final String hex;

  /// 0xFFRRGGBB, ready for Flutter's `Color(int)`.
  final int argb;

  @override
  String toString() => 'GtaColor($name, $hex)';
}
