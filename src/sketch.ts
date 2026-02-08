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

export const createTileSet = (): Tile[] => {
  const tiles: Tile[] = [];
  let id = 0;

  tiles.push({
    id: id++,
    name: "air",
    weight: 1,
    sockets: socketAll("air"),
    solid: false,
  });

  tiles.push({
    id: id++,
    name: "solid",
    weight: 0.6,
    sockets: socketAll("solid"),
    solid: true,
  });

  for (const dir of directions) {
    tiles.push({
      id: id++,
      name: `surface_${dir.name}`,
      weight: 0.9,
      sockets: {
        px: "solid",
        nx: "solid",
        py: "solid",
        ny: "solid",
        pz: "solid",
        nz: "solid",
        [dir.name]: "air",
      },
      solid: true,
    });
  }

  tiles.push({
    id: id++,
    name: "column",
    weight: 0.35,
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
    weight: 0.25,
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
    weight: 0.25,
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
    weight: 0.25,
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

