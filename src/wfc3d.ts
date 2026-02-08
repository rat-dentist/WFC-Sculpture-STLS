import { directions, type Config, type Tile } from "./sketch";

type Cell = {
  options: Set<number>;
};

type Grid = {
  cells: Cell[];
  sizeX: number;
  sizeY: number;
  sizeZ: number;
};

const indexFor = (x: number, y: number, z: number, sizeX: number, sizeY: number) =>
  x + y * sizeX + z * sizeX * sizeY;

const inBounds = (x: number, y: number, z: number, sizeX: number, sizeY: number, sizeZ: number) =>
  x >= 0 && y >= 0 && z >= 0 && x < sizeX && y < sizeY && z < sizeZ;

const seededRandom = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const pickWeighted = (rng: () => number, options: number[], tiles: Tile[]) => {
  let total = 0;
  for (const id of options) total += tiles[id].weight;
  let target = rng() * total;
  for (const id of options) {
    target -= tiles[id].weight;
    if (target <= 0) return id;
  }
  return options[options.length - 1];
};

const filterCompatible = (tileOptions: Set<number>, neighborOptions: Set<number>, dirName: string, tiles: Tile[]) => {
  const allowed = new Set<number>();
  for (const nId of neighborOptions) {
    for (const tId of tileOptions) {
      if (tiles[tId].sockets[dirName as keyof Tile["sockets"]] === tiles[nId].sockets[opposite(dirName)]) {
        allowed.add(nId);
        break;
      }
    }
  }
  return allowed;
};

const opposite = (dirName: string) => {
  switch (dirName) {
    case "px":
      return "nx";
    case "nx":
      return "px";
    case "py":
      return "ny";
    case "ny":
      return "py";
    case "pz":
      return "nz";
    default:
      return "pz";
  }
};

const cloneOptions = (tiles: Tile[]) => new Set<number>(tiles.map((tile) => tile.id));

const applyBoundary = (grid: Grid, config: Config, tiles: Tile[]) => {
  if (!config.boundaryAir) return;
  const airId = tiles.find((tile) => tile.name === "air")?.id ?? 0;
  for (let z = 0; z < grid.sizeZ; z += 1) {
    for (let y = 0; y < grid.sizeY; y += 1) {
      for (let x = 0; x < grid.sizeX; x += 1) {
        if (x === 0 || y === 0 || z === 0 || x === grid.sizeX - 1 || y === grid.sizeY - 1 || z === grid.sizeZ - 1) {
          grid.cells[indexFor(x, y, z, grid.sizeX, grid.sizeY)].options = new Set([airId]);
        }
      }
    }
  }
};

const propagate = (grid: Grid, tiles: Tile[], queue: number[]) => {
  while (queue.length > 0) {
    const cellIndex = queue.shift();
    if (cellIndex === undefined) break;
    const cell = grid.cells[cellIndex];
    const z = Math.floor(cellIndex / (grid.sizeX * grid.sizeY));
    const rem = cellIndex - z * grid.sizeX * grid.sizeY;
    const y = Math.floor(rem / grid.sizeX);
    const x = rem - y * grid.sizeX;

    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      const nz = z + dir.dz;
      if (!inBounds(nx, ny, nz, grid.sizeX, grid.sizeY, grid.sizeZ)) continue;
      const neighborIndex = indexFor(nx, ny, nz, grid.sizeX, grid.sizeY);
      const neighbor = grid.cells[neighborIndex];
      const filtered = filterCompatible(cell.options, neighbor.options, dir.name, tiles);
      if (filtered.size === 0) {
        neighbor.options.clear();
      } else if (filtered.size !== neighbor.options.size) {
        neighbor.options = filtered;
        queue.push(neighborIndex);
      }
    }
  }
};

const findLowestEntropy = (grid: Grid, rng: () => number) => {
  let lowest = Infinity;
  let indices: number[] = [];
  for (let i = 0; i < grid.cells.length; i += 1) {
    const count = grid.cells[i].options.size;
    if (count <= 1) continue;
    if (count < lowest) {
      lowest = count;
      indices = [i];
    } else if (count === lowest) {
      indices.push(i);
    }
  }
  if (indices.length === 0) return -1;
  return indices[Math.floor(rng() * indices.length)];
};

const hasContradiction = (grid: Grid) => grid.cells.some((cell) => cell.options.size === 0);

export const runWfc = (config: Config, tiles: Tile[]) => {
  const rng = seededRandom(config.seed);
  for (let attempt = 0; attempt < config.maxRetries; attempt += 1) {
    const grid: Grid = {
      sizeX: config.sizeX,
      sizeY: config.sizeY,
      sizeZ: config.sizeZ,
      cells: Array.from({ length: config.sizeX * config.sizeY * config.sizeZ }, () => ({
        options: cloneOptions(tiles),
      })),
    };

    applyBoundary(grid, config, tiles);
    propagate(grid, tiles, grid.cells.map((_, i) => i));

    while (true) {
      if (hasContradiction(grid)) break;
      const index = findLowestEntropy(grid, rng);
      if (index === -1) return grid;
      const options = Array.from(grid.cells[index].options);
      const chosen = pickWeighted(rng, options, tiles);
      grid.cells[index].options = new Set([chosen]);
      propagate(grid, tiles, [index]);
    }
  }
  throw new Error("WFC failed after max retries");
};

export const collapseToTiles = (grid: Grid, tiles: Tile[]) => {
  return grid.cells.map((cell) => {
    const id = Array.from(cell.options)[0];
    return tiles[id];
  });
};

export const applyGravity = (tilesOut: Tile[], config: Config, tiles: Tile[]) => {
  if (!config.settleGravity) return tilesOut;
  const airId = tiles.find((tile) => tile.name === "air")?.id ?? 0;
  const sizeX = config.sizeX;
  const sizeY = config.sizeY;
  const sizeZ = config.sizeZ;
  const solidById = new Set(tiles.filter((tile) => tile.solid).map((tile) => tile.id));
  let changed = true;
  const ids = tilesOut.map((tile) => tile.id);
  while (changed) {
    changed = false;
    for (let z = 0; z < sizeZ; z += 1) {
      for (let y = 1; y < sizeY; y += 1) {
        for (let x = 0; x < sizeX; x += 1) {
          const idx = indexFor(x, y, z, sizeX, sizeY);
          const below = indexFor(x, y - 1, z, sizeX, sizeY);
          if (solidById.has(ids[idx]) && !solidById.has(ids[below])) {
            ids[idx] = airId;
            changed = true;
          }
        }
      }
    }
  }
  return ids.map((id) => tiles[id]);
};

export const indexOf = indexFor;
