import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Image } from 'expo-image';
import SignatureScreen from 'expo-signature-canvas';

export default function App() {
  const [signature, setSignature] = useState(null);
  const ref = useRef();

  const handleSignature = signature => {
    console.log(signature);
    setSignature(signature);
  };

  const handleEmpty = () => {
    console.log('Empty');
  };

  const handleClear = () => {
    setSignature(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.preview}>
        {signature ? (
          <Image
            contentFit="contain"
            style={{ width: 335, height: 114 }}
            source={{ uri: signature }}
          />
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <SignatureScreen 
          ref={ref}
          onOK={handleSignature} 
          onEmpty={handleEmpty} 
          onClear={handleClear}
          backgroundColor="white"
        />
      </View>
      <View style={styles.row}>
        <Button title="Save" onPress={() => ref.current?.readSignature()} />
        <Button title="Clear" onPress={() => ref.current?.clearSignature()} />
        <Button title="Undo" onPress={() => ref.current?.undo()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    height: 114,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    flex: 1,
  },
  previewText: {
    color: "#FFF",
    fontSize: 14,
    height: 40,
    lineHeight: 40,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#69B2FF",
    width: 120,
    textAlign: "center",
    marginTop: 10
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#eee'
  }
});