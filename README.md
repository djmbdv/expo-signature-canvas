# React Native Signature Canvas

[![License](https://img.shields.io/npm/l/expo-signature-canvas.svg)](https://www.npmjs.com/package/expo-signature-canvas)
[![Version](https://img.shields.io/npm/v/expo-signature-canvas)](https://www.npmjs.com/package/expo-signature-canvas)
![Downloads](https://img.shields.io/npm/dt/expo-signature-canvas)

A React Native signature and freehand drawing component powered by `@shopify/react-native-skia`. It runs natively on iOS, Android, and Expo without a WebView, and it now documents the performance-oriented stroke pipeline used by the current Skia implementation.

## Why This Package

- Native Skia rendering instead of a WebView canvas
- Smooth drawing with curved paths and eraser support
- Base64 export as PNG or JPEG
- Background and overlay image support
- Undo, redo, clear, draw, and erase controls
- TypeScript definitions included

## Release Highlights

The current release documents and exposes the drawing-path optimizations that matter most in production:

- `minDistance` is now a documented prop for filtering noisy touch input before a point is committed.
- The active stroke path uses a lower-allocation update path during touch move events.
- The README and Quick Start now describe compatibility, performance tuning, API behavior, and native limitations more clearly.

See [CHANGELOG.md](./CHANGELOG.md) for the release summary.

## Compatibility

- Expo SDK `>= 54.0.0`
- React Native `>= 0.81.0`
- React `>= 19.1.0`
- Node `>= 20.19.4`
- `expo-image` is required when using background or overlay images

## Installation

### Expo SDK 54+

```bash
npx expo install expo-signature-canvas @shopify/react-native-skia expo-image
```

### React Native CLI

```bash
npm install expo-signature-canvas @shopify/react-native-skia expo-image
cd ios && pod install
```

You can also use `yarn add expo-signature-canvas @shopify/react-native-skia expo-image` if your project uses Yarn.

`react` and `react-native` are peer dependencies and must already exist in the host app.

## Basic Usage

```jsx
import React, { useRef, useState } from 'react';
import { Button, Image, StyleSheet, View } from 'react-native';
import SignatureCanvas from 'expo-signature-canvas';

export default function SignatureScreen() {
  const ref = useRef(null);
  const [signature, setSignature] = useState(null);

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        {signature ? (
          <Image
            resizeMode="contain"
            source={{ uri: signature }}
            style={styles.previewImage}
          />
        ) : null}
      </View>

      <View style={styles.canvasWrap}>
        <SignatureCanvas
          ref={ref}
          backgroundColor="white"
          penColor="#111827"
          onOK={setSignature}
          onEmpty={() => console.log('Signature is empty')}
          onClear={() => setSignature(null)}
        />
      </View>

      <View style={styles.actions}>
        <Button title="Clear" onPress={() => ref.current?.clearSignature()} />
        <Button title="Undo" onPress={() => ref.current?.undo()} />
        <Button title="Save" onPress={() => ref.current?.readSignature()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    height: 120,
    justifyContent: 'center',
    marginTop: 16,
  },
  previewImage: {
    height: 100,
    width: 320,
  },
  canvasWrap: {
    flex: 1,
  },
  actions: {
    backgroundColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
  },
});
```

## Performance Tuning

If your users draw continuously, most of the runtime cost comes from touch move frequency and point churn, not from the final export step. These props are the main levers:

| Prop | Default | Effect |
| ---- | ---- | ---- |
| `minDistance` | `2` | Drops move events that are too close to the previous accepted point |
| `minWidth` | `1` | Lower values reduce visual weight and can help on dense signatures |
| `maxWidth` | `3` | Higher values make strokes heavier but can amplify noisy input |
| `imageType` | `image/png` | Use `image/jpeg` when output size matters more than transparency |

Recommended `minDistance` values:

- `0`: keep every point, best fidelity and highest CPU cost
- `1` to `2`: good default for signatures and general drawing
- `3` to `4`: useful on low-end devices or when finger input is especially noisy

Example tuned for lower-end devices:

```jsx
<SignatureCanvas
  minDistance={3}
  minWidth={1}
  maxWidth={2}
  imageType="image/jpeg"
/>
```

## Props

### Drawing and export

| Prop | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `backgroundColor` | `string` | `transparent` | Background fill used by the canvas and export snapshot |
| `penColor` | `string` | `black` | Stroke color used in draw mode |
| `minWidth` | `number` | `1` | Lower bound used to derive the active pen size |
| `maxWidth` | `number` | `3` | Upper bound used to derive the active pen size |
| `minDistance` | `number` | `2` | Minimum pixel distance required before a move event becomes a new stroke point |
| `imageType` | `image/png \| image/jpeg` | `image/png` | Export format used by `readSignature()` |
| `autoClear` | `boolean` | `false` | Clears the canvas automatically after a successful export |
| `dataURL` | `string` | `""` | Base64 image loaded into the canvas before drawing |

### Images and layout

| Prop | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `bgSrc` | `string \| null` | `null` | Background image rendered inside the Skia canvas and included in exports |
| `bgWidth` | `number \| null` | `null` | Legacy compatibility prop, currently not used for native scaling |
| `bgHeight` | `number \| null` | `null` | Legacy compatibility prop, currently not used for native scaling |
| `overlaySrc` | `string \| null` | `null` | Overlay image rendered above the canvas and not merged into the snapshot |
| `overlayWidth` | `number \| null` | `null` | Optional overlay width override |
| `overlayHeight` | `number \| null` | `null` | Optional overlay height override |
| `style` | `StyleProp<ViewStyle>` | `null` | Container style applied to the outer wrapper |

### Footer and compatibility props

| Prop | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `clearText` | `string` | `Clear` | Label used by the built-in clear button |
| `confirmText` | `string` | `Confirm` | Label used by the built-in confirm button |
| `descriptionText` | `string` | `Sign above` | Footer helper text |
| `webStyle` | `string` | `""` | Legacy CSS string. Native support is limited to footer hiding and border removal heuristics |

### Callbacks

| Prop | Type | Description |
| ---- | ---- | ---- |
| `onOK` | `(signature: string) => void` | Called with a Base64 data URL after a successful export |
| `onEmpty` | `() => void` | Called when `readSignature()` is invoked without any drawn content or `dataURL` |
| `onClear` | `() => void` | Called after `clearSignature()` or `autoClear` resets the canvas |
| `onUndo` | `() => void` | Called after `undo()` |
| `onRedo` | `() => void` | Called after `redo()` |
| `onDraw` | `() => void` | Called when draw mode becomes active or a draw stroke is completed |
| `onErase` | `() => void` | Called when erase mode becomes active or an erase stroke is completed |
| `onGetData` | `(data: string) => void` | Called by `getData()` with JSON describing stored paths |
| `onBegin` | `() => void` | Called when a new touch stroke starts |
| `onEnd` | `() => void` | Called when the active touch stroke ends |
| `onLoadEnd` | `() => void` | Called after the native component finishes its initial load effect |

## Ref Methods

Access methods through a ref created with `useRef(null)`.

| Method | Description |
| ---- | ---- |
| `readSignature()` | Exports the current canvas as a Base64 data URL and triggers `onOK` or `onEmpty` |
| `clearSignature()` | Removes all saved paths, the active stroke, and the redo stack |
| `undo()` | Removes the last saved stroke and pushes it to the redo stack |
| `redo()` | Restores the most recently undone stroke |
| `draw()` | Switches to draw mode |
| `erase()` | Switches to eraser mode |
| `changePenColor(color)` | Updates the active pen color and exits eraser mode |
| `changePenSize(minW, maxW)` | Updates the active pen size using the average of both values |
| `getData()` | Emits JSON metadata for the currently stored paths through `onGetData` |
| `fromData(pointGroups)` | Currently limited in the native Skia implementation and logs a warning |
| `setDataURL(url)` | Logs a warning. Use the `dataURL` prop instead |
| `reinitialize()` | Reserved compatibility method with no current native effect |

## Native Implementation Notes

This package preserves part of the historical `react-native-signature-canvas` API surface for migration convenience, but the native Skia implementation does not map every old WebView capability one to one.

- `webStyle` is not a full CSS engine. It only detects a small set of compatibility patterns.
- `fromData()` is not yet implemented as a full path replay API.
- `setDataURL()` does not mutate an existing web canvas. Prefer passing `dataURL` as a prop.
- Overlay images are visual-only and sit above the canvas; they are not merged into exported image data.

## Troubleshooting

### The canvas exports an empty signature

- Make sure the user has drawn at least one stroke before calling `readSignature()`.
- If you preload content, pass it through `dataURL`; that counts as non-empty exportable content.
- If `autoClear` is enabled, the canvas is cleared immediately after `onOK` runs.

### Drawing feels too noisy or heavy

- Increase `minDistance` to reduce touch point density.
- Lower `maxWidth` if thick strokes amplify tiny hand movements.
- Use `image/jpeg` if output size is more important than transparency.

### Background or overlay images do not look right

- Ensure the signature view has a concrete size from flex layout or explicit dimensions.
- `bgSrc` is drawn inside the canvas and exported.
- `overlaySrc` is rendered above the canvas and is not part of the exported image.

### npm audit at the repo root looks incomplete

The repository root is a library package and does not install host app peers. Run audits inside one of the sample apps under [example](./example/) to inspect a full application dependency tree.

## More Docs

- [Quick Start Guide](./QUICK_START.md)
- [Changelog](./CHANGELOG.md)
- [TypeScript definitions](./index.d.ts)
- [Example apps](./example/)
