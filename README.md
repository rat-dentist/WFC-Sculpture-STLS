# Branching Sculpture STLs

3D voxel-based branching generator with a desktop UI and STL/PNG/SVG export.

## What It Does
- Builds branching T-structure volumes over a voxel grid.
- Produces solid rectangular coral-like forms.
- Desktop UI preview with orbit controls.
- Exports exposed faces to STL.
- Exports PNG (pencil sketch look) or SVG (black/white outline).

## Desktop UI
Install dependencies, then run the Vite dev server and Electron app.
```bash
npm install
npm run dev
npm run electron
```

## Headless CLI
```bash
npx tsx src/index.ts
```

Output STL is written to `output/wfc_sculpture.stl`.

