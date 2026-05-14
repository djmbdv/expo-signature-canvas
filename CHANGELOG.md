# Changelog

All notable changes to this project will be documented in this file.

## 5.1.0

### Changed

- Reduced hot-path allocations while drawing by keeping active stroke points in mutable refs instead of cloning arrays on every move event.
- Optimized smooth path generation with cached point lookups and lighter midpoint calculations.
- Added configurable point decimation through the `minDistance` prop to reduce noisy touch input.

### Documentation

- Expanded the README with compatibility, installation, performance tuning, native behavior notes, and troubleshooting.
- Updated the Quick Start guide to show current installation commands and the `minDistance` tuning prop.
- Added a changelog so release notes can ship with the package.
