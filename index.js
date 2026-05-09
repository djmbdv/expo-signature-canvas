import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
  useEffect
} from "react";
import { View, StyleSheet, PanResponder, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import {
  Canvas,
  Path,
  Skia,
  ImageFormat,
  useCanvasRef,
  useImage,
  Image as SkiaImage
} from "@shopify/react-native-skia";

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  canvasContainer: {
    flex: 1,
    position: "relative",
  },
  canvas: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
  absoluteImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#dcdcdc",
  },
  buttonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "bold",
  },
  description: {
    color: "#c3c3c3",
    fontSize: 12,
    textAlign: "center",
  },
});

const SignatureView = forwardRef(
  (
    {
      backgroundColor = "transparent",
      penColor = "black",
      minWidth = 1,
      maxWidth = 3,
      onOK = () => { },
      onEmpty = () => { },
      onClear = () => { },
      onUndo = () => { },
      onRedo = () => { },
      onDraw = () => { },
      onErase = () => { },
      onGetData = () => { },
      onBegin = () => { },
      onEnd = () => { },
      onLoadEnd = () => { },
      style = null,
      imageType = "image/png",

      // Legacy UI & Web Props
      autoClear = false,
      clearText = "Clear",
      confirmText = "Confirm",
      descriptionText = "Sign above",
      webStyle = "",
      dataURL = "",
      bgSrc = null,
      bgWidth = null,
      bgHeight = null,
      overlaySrc = null,
      overlayWidth = null,
      overlayHeight = null,
    },
    ref
  ) => {
    const canvasRef = useCanvasRef();

    const [paths, setPaths] = useState([]);
    const [redoPaths, setRedoPaths] = useState([]);
    const [currentPoints, setCurrentPoints] = useState([]);

    const [isErasing, setIsErasing] = useState(false);
    const [currentPenColor, setCurrentPenColor] = useState(penColor);
    const [currentPenSize, setCurrentPenSize] = useState((minWidth + maxWidth) / 2);

    // Legacy CSS detection hacks for backward compatibility
    const hideFooter = useMemo(() => {
      const wStyle = webStyle.toLowerCase().replace(/\s+/g, '');
      return wStyle.includes('.m-signature-pad--footer{display:none');
    }, [webStyle]);

    const removeBorder = useMemo(() => {
      const wStyle = webStyle.toLowerCase().replace(/\s+/g, '');
      return wStyle.includes('border:none') || wStyle.includes('box-shadow:none');
    }, [webStyle]);

    // Canvas layout state for background rendering
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // Load background image natively in Skia
    const skiaBgImage = useImage(bgSrc);

    // Load dataURL image natively in Skia
    const [skiaDataImage, setSkiaDataImage] = useState(null);

    const loadSkiaDataImage = useCallback((url) => {
      if (url) {
        try {
          const b64 = url.split(',')[1] || url;
          const data = Skia.Data.fromBase64(b64);
          const img = Skia.Image.MakeImageFromEncoded(data);
          setSkiaDataImage(img);
        } catch (error) {
          console.warn("Failed to decode dataURL for Skia:", error);
        }
      } else {
        setSkiaDataImage(null);
      }
    }, []);

    useEffect(() => {
      loadSkiaDataImage(dataURL);
    }, [dataURL, loadSkiaDataImage]);

    // Lifecycle: onLoadEnd equivalent
    useEffect(() => {
      onLoadEnd();
    }, []);

    const createSmoothPath = useCallback((points) => {
      const path = Skia.Path.Make();
      if (points.length === 0) return path;
      if (points.length === 1) {
        path.moveTo(points[0].x, points[0].y);
        path.lineTo(points[0].x + 0.1, points[0].y + 0.1);
        return path;
      }

      path.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const xMid = (points[i].x + points[i + 1].x) / 2;
        const yMid = (points[i].y + points[i + 1].y) / 2;
        path.quadTo(points[i].x, points[i].y, xMid, yMid);
      }
      path.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      return path;
    }, []);

    const activePath = useMemo(() => {
      return createSmoothPath(currentPoints);
    }, [currentPoints, createSmoothPath]);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          onBegin();
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPoints([{ x: locationX, y: locationY }]);
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPoints((prev) => [...prev, { x: locationX, y: locationY }]);
        },
        onPanResponderRelease: () => {
          onEnd();
          setCurrentPoints((prevPoints) => {
            if (prevPoints.length > 0) {
              const newPathObj = {
                path: createSmoothPath(prevPoints),
                points: prevPoints,
                color: isErasing ? "transparent" : currentPenColor,
                size: currentPenSize,
                isEraser: isErasing,
              };
              setPaths((prev) => [...prev, newPathObj]);
              setRedoPaths([]);
            }
            return [];
          });

          if (isErasing) onErase();
          else onDraw();
        },
      })
    ).current;

    const performReadSignature = useCallback(() => {
      if (paths.length === 0 && currentPoints.length === 0 && !dataURL) {
        onEmpty();
        return;
      }

      const image = canvasRef.current?.makeImageSnapshot();
      if (image) {
        const format = imageType.includes("jpeg") || imageType.includes("jpg")
          ? ImageFormat.JPEG
          : ImageFormat.PNG;

        const base64 = image.encodeToBase64(format, 100);
        const mime = format === ImageFormat.JPEG ? "image/jpeg" : "image/png";
        const result = `data:${mime};base64,${base64}`;

        onOK(result);

        if (autoClear) {
          performClearSignature();
        }
      }
    }, [paths, currentPoints, dataURL, imageType, autoClear, onOK, onEmpty]);

    const performClearSignature = useCallback(() => {
      setPaths([]);
      setRedoPaths([]);
      setCurrentPoints([]);
      onClear();
    }, [onClear]);

    useImperativeHandle(
      ref,
      () => ({
        readSignature: performReadSignature,
        clearSignature: performClearSignature,
        undo: () => {
          setPaths((prev) => {
            if (prev.length === 0) return prev;
            const newPaths = [...prev];
            const popped = newPaths.pop();
            setRedoPaths((r) => [...r, popped]);
            return newPaths;
          });
          onUndo();
        },
        redo: () => {
          setRedoPaths((prev) => {
            if (prev.length === 0) return prev;
            const newRedo = [...prev];
            const popped = newRedo.pop();
            setPaths((p) => [...p, popped]);
            return newRedo;
          });
          onRedo();
        },
        draw: () => setIsErasing(false),
        erase: () => setIsErasing(true),
        changePenColor: (color) => {
          setCurrentPenColor(color);
          setIsErasing(false);
        },
        changePenSize: (minW, maxW) => setCurrentPenSize((minW + maxW) / 2),
        getData: () => {
          const data = JSON.stringify(paths.map((p, i) => ({
            id: i,
            color: p.color,
            size: p.size,
            points: p.points
          })));
          onGetData(data);
        },
        fromData: (pointGroups, suppressClear = false) => {
          if (!Array.isArray(pointGroups)) return;

          const newPaths = pointGroups.map((group) => {
            const points = group.points || [];
            return {
              path: createSmoothPath(points),
              points: points,
              color: group.color || currentPenColor,
              size: group.size || currentPenSize,
              isEraser: group.color === "transparent",
            };
          });

          if (suppressClear) {
            setPaths((prev) => [...prev, ...newPaths]);
          } else {
            setPaths(newPaths);
          }
          setRedoPaths([]);
        },
        setDataURL: (url) => {
          loadSkiaDataImage(url);
        },
        reinitialize: () => { },
      }),
      [paths, currentPoints, currentPenColor, currentPenSize, isErasing, performReadSignature, performClearSignature, onUndo, onRedo, onGetData, loadSkiaDataImage]
    );

    return (
      <View
        style={[
          defaultStyles.container,
          removeBorder && { borderWidth: 0, shadowOpacity: 0, elevation: 0, borderRadius: 0 },
          style
        ]}
      >
        <View
          style={defaultStyles.canvasContainer}
          {...panResponder.panHandlers}
          onLayout={(e) => setCanvasSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        >
          {/* Canvas handles background, dataURL and new strokes so they all export together natively */}
          <Canvas style={[defaultStyles.canvas, { backgroundColor }]} ref={canvasRef}>
            {/* Draw Background Image inside Canvas */}
            {skiaBgImage && canvasSize.width > 0 && (
              <SkiaImage
                image={skiaBgImage}
                x={0}
                y={0}
                width={canvasSize.width}
                height={canvasSize.height}
                fit="cover"
              />
            )}

            {/* Draw previously saved dataURL inside Canvas */}
            {skiaDataImage && canvasSize.width > 0 && (
              <SkiaImage
                image={skiaDataImage}
                x={0}
                y={0}
                width={canvasSize.width}
                height={canvasSize.height}
                fit="contain"
              />
            )}

            {paths.map((p, index) => (
              <Path
                key={index}
                path={p.path}
                color={p.color}
                style="stroke"
                strokeWidth={p.size}
                strokeCap="round"
                strokeJoin="round"
                blendMode={p.isEraser ? "clear" : "srcOver"}
              />
            ))}

            {currentPoints.length > 0 && (
              <Path
                path={activePath}
                color={isErasing ? "transparent" : currentPenColor}
                style="stroke"
                strokeWidth={currentPenSize}
                strokeCap="round"
                strokeJoin="round"
                blendMode={isErasing ? "clear" : "srcOver"}
              />
            )}
          </Canvas>

          {/* Overlay Image Prop */}
          {overlaySrc && (
            <Image
              source={{ uri: overlaySrc }}
              style={[defaultStyles.absoluteImage, { width: overlayWidth || "100%", height: overlayHeight || "100%" }]}
              contentFit="cover"
              pointerEvents="none"
            />
          )}
        </View>

        {/* Legacy Footer UI */}
        {!hideFooter && (
          <View style={defaultStyles.footer}>
            <Pressable
              style={({ pressed }) => [defaultStyles.button, { opacity: pressed ? 0.5 : 1 }]}
              onPress={performClearSignature}
            >
              <Text style={defaultStyles.buttonText}>{clearText}</Text>
            </Pressable>
            <Text style={defaultStyles.description}>{descriptionText}</Text>
            <Pressable
              style={({ pressed }) => [defaultStyles.button, { opacity: pressed ? 0.5 : 1 }]}
              onPress={performReadSignature}
            >
              <Text style={defaultStyles.buttonText}>{confirmText}</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }
);

export default SignatureView;
