const { performance } = require('perf_hooks');

// In React, an update requires spread [...prev, point],
// allocating a new array, causing a full re-render, and calculating the smooth path.
// Skia's useSharedValue + path.lineTo allows mutability without re-renders.

// We will replace currentPoints state with a regular ref
// and the current active path with a state that we update on release,
// OR a skia path ref that we mutate and trigger re-render on Skia Canvas.
