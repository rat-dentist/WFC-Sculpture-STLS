# WFC Sculpture STLs

3D voxel-based Wave Function Collapse generator that exports a watertight ASCII STL.

## What It Does
- Runs a 3D WFC solver over a voxel grid.
- Collapses to solid/air tiles plus oriented surface and beam tiles.
- Exports exposed faces to STL for printing or further modeling.

## Run
This project is intentionally minimal and uses TypeScript files without a build chain.
Use any TS runner you prefer, or compile with `tsc`.

Example (with `tsx`):
```bash
npx tsx src/index.ts
```

Output STL is written to `output/wfc_sculpture.stl`.

