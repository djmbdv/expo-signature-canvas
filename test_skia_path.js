// Mock Skia Path
class MockSkiaPath {
  constructor() {
    this.points = [];
  }
  moveTo(x, y) { this.points.push({type: 'M', x, y}); }
  lineTo(x, y) { this.points.push({type: 'L', x, y}); }
  quadTo(x1, y1, x2, y2) { this.points.push({type: 'Q', x1, y1, x2, y2}); }
  reset() { this.points = []; }
}
