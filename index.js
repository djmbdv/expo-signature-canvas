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

const shouldKeepPoint = (points, x, y, minDistanceSquared) => {
  if (points.length === 0) return true;

  const lastPoint = points[points.length - 1];
  const deltaX = x - lastPoint.x;
  const deltaY = y - lastPoint.y;

  return (deltaX * deltaX) + (deltaY * deltaY) >= minDistanceSquared;
};

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
      minDistance = 2,
      onOK = () => {},
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
    const [_redoPaths, setRedoPaths] = useState([]);
    const currentPointsRef = useRef([]);
    const [activePointCount, setActivePointCount] = useState(0);

    const [isErasing, setIsErasing] = useState(false);
    const [currentPenColor, setCurrentPenColor] = useState(penColor);
    const [currentPenSize, setCurrentPenSize] = useState((minWidth + maxWidth) / 2);
    const minDistanceSafe = Math.max(0, minDistance);
    const minDistanceSquared = minDistanceSafe * minDistanceSafe;
    const isErasingRef = useRef(isErasing);
    const currentPenColorRef = useRef(currentPenColor);
    const currentPenSizeRef = useRef(currentPenSize);

    // Legacy CSS detection hacks for backward compatibility
    const { hideFooter, removeBorder } = useMemo(() => {
      const wStyle = webStyle.toLowerCase().replace(/\s+/g, '');
      return {
        hideFooter: wStyle.includes('.m-signature-pad--footer{display:none'),
        removeBorder: wStyle.includes('border:none') || wStyle.includes('box-shadow:none')
      };
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

    useEffect(() => {
      isErasingRef.current = isErasing;
    }, [isErasing]);

    useEffect(() => {
      currentPenColorRef.current = currentPenColor;
    }, [currentPenColor]);

    useEffect(() => {
      currentPenSizeRef.current = currentPenSize;
    }, [currentPenSize]);

    const createSmoothPath = useCallback((points) => {
      const len = points.length;
      const path = Skia.Path.Make();
      if (len === 0) return path;

      const firstPoint = points[0];
      path.moveTo(firstPoint.x, firstPoint.y);

      if (len === 1) {
        path.lineTo(firstPoint.x + 0.1, firstPoint.y + 0.1);
        return path;
      }

      for (let i = 1; i < len - 1; i++) {
        const currentPoint = points[i];
        const nextPoint = points[i + 1];
        const xMid = (currentPoint.x + nextPoint.x) * 0.5;
        const yMid = (currentPoint.y + nextPoint.y) * 0.5;

        path.quadTo(currentPoint.x, currentPoint.y, xMid, yMid);
      }

      const lastPoint = points[len - 1];
      path.lineTo(lastPoint.x, lastPoint.y);
      return path;
    }, []);

    const activePath = useMemo(() => {
      return createSmoothPath(currentPointsRef.current);
    }, [activePointCount, createSmoothPath]);

    const panResponder = useMemo(
      () => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          onBegin();
          const { locationX, locationY } = evt.nativeEvent;
          currentPointsRef.current = [{ x: locationX, y: locationY }];
          setActivePointCount(1);
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          const points = currentPointsRef.current;
          if (!shouldKeepPoint(points, locationX, locationY, minDistanceSquared)) return;

          points.push({ x: locationX, y: locationY });
          setActivePointCount(points.length);
        },
        onPanResponderRelease: () => {
          onEnd();
          const points = currentPointsRef.current;
          const wasErasing = isErasingRef.current;

          if (points.length > 0) {
            const newPathObj = {
              path: createSmoothPath(points),
              points,
              color: wasErasing ? "transparent" : currentPenColorRef.current,
              size: currentPenSizeRef.current,
              isEraser: wasErasing,
            };
            setPaths((prev) => [...prev, newPathObj]);
            setRedoPaths([]);
          }

          currentPointsRef.current = [];
          setActivePointCount(0);

          if (wasErasing) onErase();
          else onDraw();
        },
      }),
      [createSmoothPath, minDistanceSquared, onBegin, onDraw, onEnd, onErase]
    );

    const performClearSignature = useCallback(() => {
      setPaths([]);
      setRedoPaths([]);
      currentPointsRef.current = [];
      setActivePointCount(0);
      onClear();
    }, [onClear]);

    const performReadSignature = useCallback(() => {
      if (paths.length === 0 && currentPointsRef.current.length === 0 && !dataURL) {
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
    }, [paths, dataURL, imageType, autoClear, onOK, onEmpty, performClearSignature]);

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
              color: group.color ?? currentPenColor,
              size: group.size ?? currentPenSize,
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
        [paths, currentPenColor, currentPenSize, createSmoothPath, performReadSignature, performClearSignature, onUndo, onRedo, onGetData, loadSkiaDataImage]
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

            {activePointCount > 0 && (
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
