import { useRef, useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { Image } from 'expo-image';
import SignatureCanvas from 'expo-signature-canvas';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function BottomSheetTest() {
  const signatureRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const [signature, setSignature] = useState(null);

  const snapPoints = useMemo(() => ['50%', '90%'], []);

  const handleSignature = (sig) => {
    console.log('Signature captured:', sig.length, 'bytes');
    setSignature(sig);
    bottomSheetRef.current?.close();
  };

  const handleEmpty = () => {
    Alert.alert('Empty', 'Please draw a signature first');
  };

  const handleOpenSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const handleCloseSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  const handleConfirm = () => {
    signatureRef.current?.readSignature();
  };

  const handleSheetChanges = useCallback((index) => {
    console.log('Bottom sheet index changed to:', index);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bottom Sheet Signature Test</Text>
        <Text style={styles.description}>
          Test signature canvas inside a bottom sheet.
          Close and reopen the sheet to verify state preservation.
        </Text>

        <Button title="Open Signature Sheet" onPress={handleOpenSheet} />

        {signature && (
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Captured Signature:</Text>
            <Image
              source={{ uri: signature }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            <Button title="Clear Result" onPress={() => setSignature(null)} />
          </View>
        )}
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        enableContentPanningGesture={false}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Sign Here</Text>

          <View style={styles.signatureContainer}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleSignature}
              onEmpty={handleEmpty}
              onClear={() => console.log('Cleared')}
              onBegin={() => console.log('Begin drawing')}
              onEnd={() => console.log('End drawing')}
              onLoadEnd={() => console.log('WebView loaded')}
              penColor="black"
              backgroundColor="white"
              webStyle={`
                .m-signature-pad {
                  box-shadow: none;
                  border: none;
                }
                .m-signature-pad--body {
                  border: none;
                }
                .m-signature-pad--footer {
                  display: none;
                }
              `}
              style={styles.signature}
            />
          </View>

          <View style={styles.controls}>
            <Button title="Clear" onPress={handleClear} color="#ff6b6b" />
            <Button title="Confirm" onPress={handleConfirm} color="#51cf66" />
            <Button title="Close" onPress={handleCloseSheet} />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  preview: {
    marginTop: 30,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  previewImage: {
    width: 250,
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  sheetContent: {
    flex: 1,
    padding: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  signatureContainer: {

    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 16,
    height: 300,
  },
  signature: {
    height: 300,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
});
