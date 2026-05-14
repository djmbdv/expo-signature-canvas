declare module "expo-signature-canvas" {
  import React from "react";
  import { StyleProp, ViewStyle } from "react-native";

  /** Supported export MIME types for signature snapshots. */
  type ImageType = "image/png" | "image/jpeg" | "image/svg+xml";

  /** Base64 data URL used for import or export operations. */
  type DataURL = string;

  type ForwardRef<T, P> = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<T>
  >;

  /** Called when `readSignature()` completes successfully. */
  type SignatureCallback = (signature: string) => void;
  /** Generic callback with no payload. */
  type EmptyCallback = () => void;
  /** Generic callback for recoverable runtime errors. */
  type ErrorCallback = (error: Error) => void;

  /**
   * Props for the native Skia signature canvas.
   *
   * Some props are kept for compatibility with the older WebView-based API.
   * In the native implementation, compatibility props may be partially supported
   * or act as no-ops.
   */
  export type SignatureViewProps = {
    /** Legacy compatibility prop. Currently not used by the native implementation. */
    androidHardwareAccelerationDisabled?: boolean;
    /** Automatically clears the canvas after a successful `onOK` export. */
    autoClear?: boolean;
    /** Background fill color used by the canvas and export snapshot. */
    backgroundColor?: string;
    /** Legacy compatibility prop for background sizing. */
    bgHeight?: number;
    /** Legacy compatibility prop for background sizing. */
    bgWidth?: number;
    /** Background image rendered inside the Skia canvas and included in exports. */
    bgSrc?: string;
    /** Label for the built-in clear button. */
    clearText?: string;
    /** Label for the built-in confirm button. */
    confirmText?: string;
    /** Legacy compatibility prop. Not used by the native implementation. */
    customHtml?: (injectedJavaScript: string) => string;
    /** Base64 image loaded into the canvas before the user starts drawing. */
    dataURL?: DataURL;
    /** Helper text displayed in the built-in footer. */
    descriptionText?: string;
    /** Legacy compatibility prop. Not used by the native implementation. */
    dotSize?: number;
    /** Export format returned by `readSignature()`. */
    imageType?: ImageType;
    /** Minimum pen width used to derive the active stroke width. */
    minWidth?: number;
    /** Maximum pen width used to derive the active stroke width. */
    maxWidth?: number;
    /** Minimum distance in pixels required before a move event becomes a new point. */
    minDistance?: number;
    /** Recoverable runtime error callback. Reserved for compatibility. */
    onError?: ErrorCallback;
    /** Legacy compatibility prop. Not used by the native implementation. */
    nestedScrollEnabled?: boolean;
    /** Legacy compatibility prop. Not used by the native implementation. */
    showsVerticalScrollIndicator?: boolean;
    /** Called with the exported Base64 data URL after a successful save. */
    onOK?: SignatureCallback;
    /** Called when the user attempts to export an empty canvas. */
    onEmpty?: EmptyCallback;
    /** Called after the canvas is cleared. */
    onClear?: EmptyCallback;
    /** Called after an undo operation completes. */
    onUndo?: EmptyCallback;
    /** Called after a redo operation completes. */
    onRedo?: EmptyCallback;
    /** Called when draw mode becomes active or after a draw stroke completes. */
    onDraw?: EmptyCallback;
    /** Called when erase mode becomes active or after an erase stroke completes. */
    onErase?: EmptyCallback;
    /** Called by `getData()` with JSON metadata describing stored paths. */
    onGetData?: (data: string) => void;
    /** Legacy compatibility prop. Not used by the native implementation. */
    onChangePenColor?: EmptyCallback;
    /** Legacy compatibility prop. Not used by the native implementation. */
    onChangePenSize?: EmptyCallback;
    /** Called when a new touch stroke starts. */
    onBegin?: EmptyCallback;
    /** Called when the active touch stroke ends. */
    onEnd?: EmptyCallback;
    /** Called after the initial native load effect completes. */
    onLoadEnd?: EmptyCallback;
    /** Optional overlay image height override. */
    overlayHeight?: number;
    /** Optional overlay image width override. */
    overlayWidth?: number;
    /** Image rendered above the canvas. It is not merged into the export snapshot. */
    overlaySrc?: string;
    /** Stroke color used in draw mode. */
    penColor?: string;
    /** Legacy compatibility prop. Not used by the native implementation. */
    rotated?: boolean;
    /** Container style applied to the outer wrapper. */
    style?: StyleProp<ViewStyle>;
    /** Legacy compatibility prop. Not used by the native implementation. */
    scrollable?: boolean;
    /** Legacy compatibility prop. Not used by the native implementation. */
    trimWhitespace?: boolean;
    /**
     * Legacy CSS string.
     *
     * The native implementation only inspects a small subset of patterns,
     * such as hiding the footer or removing the border.
     */
    webStyle?: string;
    /** Legacy compatibility prop. Not used by the native implementation. */
    androidLayerType?: "none" | "software" | "hardware";
  };

  /** Imperative methods exposed through the component ref. */
  export type SignatureViewRef = {
    /** Updates the current pen color and switches back to draw mode. */
    changePenColor: (color: string) => void;
    /** Updates the pen size using the average of the provided min and max values. */
    changePenSize: (minW: number, maxW: number) => void;
    /** Clears all drawn content and the redo stack. */
    clearSignature: () => void;
    /** Switches to draw mode. */
    draw: () => void;
    /** Switches to erase mode. */
    erase: () => void;
    /** Emits JSON metadata for stored paths through `onGetData`. */
    getData: () => void;
    /** Exports the current canvas as a Base64 data URL. */
    readSignature: () => void;
    /** Removes the most recently committed stroke. */
    undo: () => void;
    /** Restores the most recently undone stroke. */
    redo: () => void;
    /**
     * Legacy compatibility method.
     *
     * Currently limited in the native Skia implementation.
     */
    fromData: (pointGroups: any[], suppressClear?: boolean) => void;
    /** Legacy compatibility method. Prefer the `dataURL` prop. */
    setDataURL: (url: string) => void;
    /** Reserved compatibility method with no current native effect. */
    reinitialize: () => void;
  };

  interface SignatureCanvasComponent
    extends ForwardRef<SignatureViewRef, SignatureViewProps> {
    displayName?: string;
  }

  const SignatureView: SignatureCanvasComponent;
  export default SignatureView;

  export { SignatureViewProps, SignatureViewRef, ImageType, DataURL };
}
