# gta-shared-colors

One color table (`colors.json`) shared by the app, admin, seller and buyer projects.
Turns the hex saved from the color picker into a color name (and back).

**Edit only `colors.json`**, then run `npm run generate`. `ts/src/colorData.ts` and
`dart/lib/src/color_data.dart` are generated. `npm test` regenerates and runs both test suites.

## TypeScript (admin / seller / buyer)

```ts
import { getColorName, getColorHex } from '@gta/colors';

getColorName('#000080');                        // "Navy Blue"
getColorName('#010082');                        // "Navy Blue" (nearest)
getColorName('#010082', { exactOnly: true });   // null
getColorHex('navy blue');                       // "#000080"
```

Install: `npm i git+ssh://git@github.com:softinvo/gta-shared-colors.git`

## Flutter (app)

```dart
import 'package:gta_colors/gta_colors.dart';

GtaColors.nameFromHex('#000080');                    // "Navy Blue"
GtaColors.nameFromHex('#010082', exactOnly: true);   // null
GtaColors.hexFromName('navy blue');                  // "#000080"
Color(GtaColors.byHex('#000080')!.argb);             // Flutter Color
```

pubspec:
```yaml
dependencies:
  gta_colors:
    git:
      url: git@github.com:softinvo/gta-shared-colors.git
      path: dart
```

## Behavior
- Hex input is normalized: `#abc`, `abc`, `#AABBCC`, `0xAABBCC`, any case. Invalid input returns null. 8-digit (alpha) values are rejected.
- Not in the list? The default returns the perceptually nearest named color (CIE Lab distance). Both languages produce identical results.
