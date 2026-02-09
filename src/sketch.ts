export type DirectionName = "px" | "nx" | "py" | "ny" | "pz" | "nz";

export type Direction = {
  name: DirectionName;
  dx: number;
  dy: number;
  dz: number;
  opposite: DirectionName;
};

export const directions: Direction[] = [
  { name: "px", dx: 1, dy: 0, dz: 0, opposite: "nx" },
  { name: "nx", dx: -1, dy: 0, dz: 0, opposite: "px" },
  { name: "py", dx: 0, dy: 1, dz: 0, opposite: "ny" },
  { name: "ny", dx: 0, dy: -1, dz: 0, opposite: "py" },
  { name: "pz", dx: 0, dy: 0, dz: 1, opposite: "nz" },
  { name: "nz", dx: 0, dy: 0, dz: -1, opposite: "pz" },
];

export type Tile = {
  id: number;
  name: string;
  weight: number;
  sockets: Record<DirectionName, "air" | "solid">;
  solid: boolean;
};

export type Config = {
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  cellSize: number;
  seed: number;
  maxRetries: number;
  boundaryAir: boolean;
  settleGravity: boolean;
  outputName: string;
};

export const defaultConfig: Config = {
  sizeX: 24,
  sizeY: 20,
  sizeZ: 24,
  cellSize: 1,
  seed: 1337,
  maxRetries: 8,
  boundaryAir: true,
  settleGravity: true,
  outputName: "wfc_sculpture.stl",
};

const socketAll = (value: "air" | "solid") => ({
  px: value,
  nx: value,
  py: value,
  ny: value,
  pz: value,
  nz: value,
});

const socketWithAir = (airDirs: DirectionName[]) => {
  const sockets = socketAll("solid");
  for (const dir of airDirs) sockets[dir] = "air";
  return sockets;
};

export const createTileSet = (): Tile[] => {
  const tiles: Tile[] = [];
  let id = 0;

  tiles.push({
    id: id++,
    name: "air",
    weight: 0.2,
    sockets: socketAll("air"),
    solid: false,
  });

  tiles.push({
    id: id++,
    name: "solid",
    weight: 1.0,
    sockets: socketAll("solid"),
    solid: true,
  });

  for (const dir of directions) {
    tiles.push({
      id: id++,
      name: `surface_${dir.name}`,
      weight: 0.9,
      sockets: socketWithAir([dir.name]),
      solid: true,
    });
  }

  const xDirs: DirectionName[] = ["px", "nx"];
  const yDirs: DirectionName[] = ["py", "ny"];
  const zDirs: DirectionName[] = ["pz", "nz"];

  for (const x of xDirs) {
    for (const y of yDirs) {
      tiles.push({
        id: id++,
        name: `edge_${x}_${y}`,
        weight: 0.8,
        sockets: socketWithAir([x, y]),
        solid: true,
      });
    }
    for (const z of zDirs) {
      tiles.push({
        id: id++,
        name: `edge_${x}_${z}`,
        weight: 0.8,
        sockets: socketWithAir([x, z]),
        solid: true,
      });
    }
  }
  for (const y of yDirs) {
    for (const z of zDirs) {
      tiles.push({
        id: id++,
        name: `edge_${y}_${z}`,
        weight: 0.8,
        sockets: socketWithAir([y, z]),
        solid: true,
      });
    }
  }

  for (const x of xDirs) {
    for (const y of yDirs) {
      for (const z of zDirs) {
        tiles.push({
          id: id++,
          name: `corner_${x}_${y}_${z}`,
          weight: 0.7,
          sockets: socketWithAir([x, y, z]),
          solid: true,
        });
      }
    }
  }

  tiles.push({
    id: id++,
    name: "column",
    weight: 0.5,
    sockets: {
      px: "air",
      nx: "air",
      py: "air",
      ny: "air",
      pz: "solid",
      nz: "solid",
    },
    solid: true,
  });

  tiles.push({
    id: id++,
    name: "beam_x",
    weight: 0.4,
    sockets: {
      px: "solid",
      nx: "solid",
      py: "air",
      ny: "air",
      pz: "air",
      nz: "air",
    },
    solid: true,
  });

  tiles.push({
    id: id++,
    name: "beam_y",
    weight: 0.4,
    sockets: {
      px: "air",
      nx: "air",
      py: "solid",
      ny: "solid",
      pz: "air",
      nz: "air",
    },
    solid: true,
  });

  tiles.push({
    id: id++,
    name: "beam_z",
    weight: 0.4,
    sockets: {
      px: "air",
      nx: "air",
      py: "air",
      ny: "air",
      pz: "solid",
      nz: "solid",
    },
    solid: true,
  });

  return tiles;
};

