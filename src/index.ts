import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { createTileSet, defaultConfig } from "./sketch";
import { applyGravity, collapseToTiles, runWfc } from "./wfc3d";
import { voxelsToStl } from "./voxels";

const config = { ...defaultConfig };
const tiles = createTileSet();
const grid = runWfc(config, tiles);
let tilesOut = collapseToTiles(grid, tiles);
tilesOut = applyGravity(tilesOut, config, tiles);
const stl = voxelsToStl(tilesOut, config);

const outputDir = join(process.cwd(), "output");
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, config.outputName);
writeFileSync(outputPath, stl, "utf8");
console.log(`Wrote ${outputPath}`);

