# React Native Signature Canvas

[![](https://img.shields.io/npm/l/expo-signature-canvas.svg)](https://www.npmjs.com/package/expo-signature-canvas)
[![](https://img.shields.io/npm/v/expo-signature-canvas)](https://www.npmjs.com/package/expo-signature-canvas)
![npm](https://img.shields.io/npm/dt/expo-signature-canvas)

A React Native component for capturing signatures or drawing on a canvas with a smooth, native feel. Works on iOS, Android, and Expo using **@shopify/react-native-skia** for exceptional performance (zero WebView dependency).

## Features

- ✅ **Cross-platform support** (iOS, Android, Expo)
- ✅ **Smooth, responsive drawing experience** fully accelerated by Skia (C++ GPU rendering)
- ✅ **Completely WebView-Free**, preventing memory leaks and avoiding slow JS bridges
- ✅ **Customizable pen color, size, and background**
- ✅ **Export signatures** instantly as Base64 PNG/JPEG 
- ✅ **Undo/redo functionality**
- ✅ **Drawing and erasing modes**
- ✅ **Full TypeScript support**

## Installation

```bash
npm install --save expo-signature-canvas @shopify/react-native-skia expo-image
```
or
```bash
yarn add expo-signature-canvas @shopify/react-native-skia expo-image
```

**Note for Expo users:** Make sure to follow the `@shopify/react-native-skia` installation guide if you are using an older version of Expo.

`react` and `react-native` remain required peer dependencies and must already be present in the host app.

## Audit Notes

The repository root is configured as a library-only package and omits peer installs during local npm operations.
Run dependency audits inside the example apps under `example/` if you want to audit a full application tree.

## Basic Usage

```jsx
import React, { useRef, useState } from 'react';
import { StyleSheet, View, Image, Button } from 'react-native';
import SignatureCanvas from 'expo-signature-canvas';

const SignatureScreen = () => {
  const [signature, setSignature] = useState(null);
  const ref = useRef();

  const handleSignature = (signature) => {
    console.log('Signature captured:', signature);
    setSignature(signature);
  };

  const handleEmpty = () => {
    console.log('Signature is empty');
  };

  const handleClear = () => {
    console.log('Signature cleared');
    setSignature(null);
  };

  const handleEnd = () => {
    ref.current?.readSignature();
  };

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        {signature && (
          <Image
            resizeMode="contain"
            style={{ width: 335, height: 114 }}
            source={{ uri: signature }}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <SignatureCanvas
          ref={ref}
          onEnd={handleEnd}
          onOK={handleSignature}
          onEmpty={handleEmpty}
          onClear={handleClear}
          penColor="#000000"
          backgroundColor="white"
        />
      </View>
      <View style={styles.row}>
        <Button title="Clear" onPress={() => ref.current?.clearSignature()} />
        <Button title="Undo" onPress={() => ref.current?.undo()} />
        <Button title="Redo" onPress={() => ref.current?.redo()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    width: 335,
    height: 114,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#eee'
  }
});

export default SignatureScreen;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `string` | `transparent` | Background color of the canvas |
| `penColor` | `string` | `black` | Color of the pen |
| `minWidth` | `number` | `1` | Minimum width of a line |
| `maxWidth` | `number` | `3` | Maximum width of a line |
| `imageType` | `string` | `image/png` | Image type for export (`image/png`, `image/jpeg`) |
| `onOK` | `function` | - | Callback after saving non-empty signature |
| `onEmpty` | `function` | - | Callback after trying to save an empty signature |
| `onClear` | `function` | - | Callback after clearing the signature |
| `onBegin` | `function` | - | Callback when a new stroke is started |
| `onEnd` | `function` | - | Callback when the stroke has ended |
| `onUndo` | `function` | - | Callback when undo() is called |
| `onRedo` | `function` | - | Callback when redo() is called |
| `onDraw` | `function` | - | Callback when drawing is enabled |
| `onErase` | `function` | - | Callback when erasing is enabled |

## Methods

Access these methods using a ref to the SignatureCanvas component:

| Method | Description |
|--------|-------------|
| `readSignature()` | Read the current signature and trigger `onOK` or `onEmpty` |
| `clearSignature()` | Clear the current signature and trigger `onClear` |
| `undo()` | Undo last stroke |
| `redo()` | Redo last stroke |
| `draw()` | Enable drawing mode |
| `erase()` | Enable erasing mode |
| `changePenColor(color)` | Change pen color |
| `changePenSize(minW, maxW)` | Change pen size |
| `getData()` | Triggers the `onGetData` callback with internal path count data |
