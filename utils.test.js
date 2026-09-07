const { createSmoothPath } = require('./utils');

const createMockPath = () => ({
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  quadTo: jest.fn(),
});

const mockSkia = {
  Path: {
    Make: jest.fn(),
  },
};

describe('createSmoothPath', () => {
  let mockPath;

  beforeEach(() => {
    mockPath = createMockPath();
    mockSkia.Path.Make.mockReturnValue(mockPath);
    jest.clearAllMocks();
  });

  test('should return an empty path when points array is empty', () => {
    const points = [];
    const path = createSmoothPath(mockSkia, points);
    expect(mockSkia.Path.Make).toHaveBeenCalled();
    expect(mockPath.moveTo).not.toHaveBeenCalled();
    expect(path).toBe(mockPath);
  });

  test('should return a path with a small line when points array has one point', () => {
    const points = [{ x: 10, y: 20 }];
    const path = createSmoothPath(mockSkia, points);
    expect(mockPath.moveTo).toHaveBeenCalledWith(10, 20);
    expect(mockPath.lineTo).toHaveBeenCalledWith(10.1, 20.1);
    expect(path).toBe(mockPath);
  });

  test('should return a smooth path for multiple points', () => {
    const points = [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 }
    ];
    // len = 3
    // firstPoint = {10, 20} -> moveTo(10, 20)
    // loop i=1:
    // currentPoint = {30, 40}, nextPoint = {50, 60}
    // xMid = 40, yMid = 50
    // quadTo(30, 40, 40, 50)
    // lastPoint = {50, 60} -> lineTo(50, 60)

    const path = createSmoothPath(mockSkia, points);
    expect(mockPath.moveTo).toHaveBeenCalledWith(10, 20);
    expect(mockPath.quadTo).toHaveBeenCalledWith(30, 40, 40, 50);
    expect(mockPath.lineTo).toHaveBeenCalledWith(50, 60);
    expect(path).toBe(mockPath);
  });

  test('should handle more than 3 points correctly', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 0 },
      { x: 30, y: 10 }
    ];
    // len = 4
    // moveTo(0, 0)
    // i=1: current={10,10}, next={20,0} -> xMid=15, yMid=5 -> quadTo(10, 10, 15, 5)
    // i=2: current={20,0}, next={30,10} -> xMid=25, yMid=5 -> quadTo(20, 0, 25, 5)
    // lineTo(30, 10)

    createSmoothPath(mockSkia, points);
    expect(mockPath.moveTo).toHaveBeenCalledWith(0, 0);
    expect(mockPath.quadTo).toHaveBeenNthCalledWith(1, 10, 10, 15, 5);
    expect(mockPath.quadTo).toHaveBeenNthCalledWith(2, 20, 0, 25, 5);
    expect(mockPath.lineTo).toHaveBeenCalledWith(30, 10);
  });
});
