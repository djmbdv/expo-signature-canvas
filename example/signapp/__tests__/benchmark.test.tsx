import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import SignatureScreen from 'expo-signature-canvas';

jest.mock('@shopify/react-native-skia', () => ({
  Canvas: 'Canvas',
  Path: 'Path',
  Image: 'Image',
  useImage: () => null,
  useCanvasRef: () => ({ current: null }),
  Skia: {
    Path: {
      Make: jest.fn(() => ({
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        quadTo: jest.fn(),
      }))
    },
    Data: {
      fromBase64: jest.fn()
    },
    Image: {
      MakeImageFromEncoded: jest.fn()
    }
  }
}));

jest.mock('expo-image', () => ({
  Image: 'Image'
}));

test('benchmark pan responder', () => {
  const ref = React.createRef();
  const root = ReactTestRenderer.create(<SignatureScreen ref={ref} />);

  // Find the View that has PanResponder handlers
  // const canvasContainer = root.root.findByProps({ testID: 'canvas-container' }); // We might need to add testID
  console.log('hi');
});
