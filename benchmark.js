const { performance } = require('perf_hooks');

function runBaseline() {
    let currentPoints = [];
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
        // simulate move
        currentPoints = [...currentPoints, { x: i, y: i }];
    }
    const end = performance.now();
    return end - start;
}

function runOptimized() {
    const currentPointsRef = { current: [] };
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
        // simulate move
        currentPointsRef.current.push({ x: i, y: i });
    }
    const end = performance.now();
    return end - start;
}

const baseline = runBaseline();
const optimized = runOptimized();

console.log(`Baseline Array Spread: ${baseline.toFixed(2)} ms`);
console.log(`Optimized Array Push: ${optimized.toFixed(2)} ms`);
console.log(`Improvement: ${(baseline / optimized).toFixed(2)}x faster`);
