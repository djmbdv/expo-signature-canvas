/**
 * Creates a smooth Skia path from an array of points using quadratic Bézier curves.
 * @param {Object} Skia - The Skia object from @shopify/react-native-skia.
 * @param {Array<{x: number, y: number}>} points - The points to create the path from.
 * @returns {Object} The created Skia Path.
 */
const createSmoothPath = (Skia, points) => {
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
};

module.exports = { createSmoothPath };
