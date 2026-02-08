import { type Config, type Tile } from "./sketch";
import { indexOf } from "./wfc3d";

const faceNormals = {
  px: [1, 0, 0],
  nx: [-1, 0, 0],
  py: [0, 1, 0],
  ny: [0, -1, 0],
  pz: [0, 0, 1],
  nz: [0, 0, -1],
} as const;

type Vec3 = [number, number, number];

const addTriangle = (triangles: string[], normal: Vec3, a: Vec3, b: Vec3, c: Vec3) => {
  triangles.push(
    `facet normal ${normal[0]} ${normal[1]} ${normal[2]}\n` +
      `  outer loop\n` +
      `    vertex ${a[0]} ${a[1]} ${a[2]}\n` +
      `    vertex ${b[0]} ${b[1]} ${b[2]}\n` +
      `    vertex ${c[0]} ${c[1]} ${c[2]}\n` +
      `  endloop\n` +
      `endfacet`
  );
};

export const voxelsToStl = (tilesOut: Tile[], config: Config) => {
  const sizeX = config.sizeX;
  const sizeY = config.sizeY;
  const sizeZ = config.sizeZ;
  const solidIds = new Set(tilesOut.filter((tile) => tile.solid).map((tile) => tile.id));
  const triangles: string[] = [];
  const s = config.cellSize;

  const isSolid = (x: number, y: number, z: number) => {
    if (x < 0 || y < 0 || z < 0 || x >= sizeX || y >= sizeY || z >= sizeZ) return false;
    const idx = indexOf(x, y, z, sizeX, sizeY);
    return solidIds.has(tilesOut[idx].id);
  };

  for (let z = 0; z < sizeZ; z += 1) {
    for (let y = 0; y < sizeY; y += 1) {
      for (let x = 0; x < sizeX; x += 1) {
        if (!isSolid(x, y, z)) continue;
        const x0 = x * s;
        const y0 = y * s;
        const z0 = z * s;
        const x1 = x0 + s;
        const y1 = y0 + s;
        const z1 = z0 + s;

        if (!isSolid(x + 1, y, z)) {
          const n = faceNormals.px;
          addTriangle(triangles, n, [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]);
          addTriangle(triangles, n, [x1, y0, z0], [x1, y1, z1], [x1, y0, z1]);
        }
        if (!isSolid(x - 1, y, z)) {
          const n = faceNormals.nx;
          addTriangle(triangles, n, [x0, y0, z0], [x0, y1, z1], [x0, y1, z0]);
          addTriangle(triangles, n, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1]);
        }
        if (!isSolid(x, y + 1, z)) {
          const n = faceNormals.py;
          addTriangle(triangles, n, [x0, y1, z0], [x1, y1, z1], [x1, y1, z0]);
          addTriangle(triangles, n, [x0, y1, z0], [x0, y1, z1], [x1, y1, z1]);
        }
        if (!isSolid(x, y - 1, z)) {
          const n = faceNormals.ny;
          addTriangle(triangles, n, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1]);
          addTriangle(triangles, n, [x0, y0, z0], [x1, y0, z1], [x0, y0, z1]);
        }
        if (!isSolid(x, y, z + 1)) {
          const n = faceNormals.pz;
          addTriangle(triangles, n, [x0, y0, z1], [x1, y1, z1], [x1, y0, z1]);
          addTriangle(triangles, n, [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]);
        }
        if (!isSolid(x, y, z - 1)) {
          const n = faceNormals.nz;
          addTriangle(triangles, n, [x0, y0, z0], [x1, y0, z0], [x1, y1, z0]);
          addTriangle(triangles, n, [x0, y0, z0], [x1, y1, z0], [x0, y1, z0]);
        }
      }
    }
  }

  return `solid wfc\n${triangles.join("\n")}\nendsolid wfc\n`;
};
