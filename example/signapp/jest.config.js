module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^expo-image$': '<rootDir>/node_modules/expo-image',
    '^@shopify/react-native-skia$': '<rootDir>/node_modules/@shopify/react-native-skia',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-community)?|expo-image|@expo(nent)?/.*)/)'
  ]
};
