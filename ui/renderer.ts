import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { applyGravity, collapseToTiles, runWfc } from "@core/wfc3d";
import { createTileSet, defaultConfig, type Config, type Tile } from "@core/sketch";

type Face = {
  normal: [number, number, number];
  vertices: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]];
};

const ui = {
  canvas: document.getElementById("preview") as HTMLCanvasElement,
  status: document.getElementById("status") as HTMLDivElement,
  generate: document.getElementById("btn-generate") as HTMLButtonElement,
  exportStl: document.getElementById("btn-stl") as HTMLButtonElement,
  exportPng: document.getElementById("btn-png") as HTMLButtonElement,
  exportSvg: document.getElementById("btn-svg") as HTMLButtonElement,
  sizeX: document.getElementById("size-x") as HTMLInputElement,
  sizeY: document.getElementById("size-y") as HTMLInputElement,
  sizeZ: document.getElementById("size-z") as HTMLInputElement,
  cellSize: document.getElementById("cell-size") as HTMLInputElement,
  seed: document.getElementById("seed") as HTMLInputElement,
  boundaryAir: document.getElementById("boundary-air") as HTMLInputElement,
  gravity: document.getElementById("gravity") as HTMLInputElement,
  pngSize: document.getElementById("png-size") as HTMLInputElement,
  strokeWeight: document.getElementById("stroke-weight") as HTMLInputElement,
  strokeJitter: document.getElementById("stroke-jitter") as HTMLInputElement,
};

const tiles = createTileSet();
let currentTiles: Tile[] = [];
let currentConfig: Config = { ...defaultConfig };
let currentFaces: Face[] = [];

const renderer = new THREE.WebGLRenderer({ canvas: ui.canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0b0b0a);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b0b0a, 20, 160);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
camera.position.set(34, 26, 34);

const controls = new OrbitControls(camera, ui.canvas);
controls.enableDamping = true;

const lightA = new THREE.DirectionalLight(0xf5e6c8, 1.1);
lightA.position.set(20, 40, 20);
const lightB = new THREE.DirectionalLight(0x8c7a55, 0.5);
lightB.position.set(-20, 10, -10);
const ambient = new THREE.AmbientLight(0x554f40, 0.35);
scene.add(lightA, lightB, ambient);

const group = new THREE.Group();
scene.add(group);

const resize = () => {
  const { clientWidth, clientHeight } = ui.canvas;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
};

window.addEventListener("resize", resize);

const setStatus = (message: string) => {
  ui.status.textContent = message;
};

const readConfig = (): Config => ({
  sizeX: Number(ui.sizeX.value),
  sizeY: Number(ui.sizeY.value),
  sizeZ: Number(ui.sizeZ.value),
  cellSize: Number(ui.cellSize.value),
  seed: Number(ui.seed.value),
  maxRetries: defaultConfig.maxRetries,
  boundaryAir: ui.boundaryAir.checked,
  settleGravity: ui.gravity.checked,
  outputName: defaultConfig.outputName,
});

const indexOf = (x: number, y: number, z: number, sizeX: number, sizeY: number) => x + y * sizeX + z * sizeX * sizeY;

const buildFaces = (tilesOut: Tile[], config: Config): Face[] => {
  const sizeX = config.sizeX;
  const sizeY = config.sizeY;
  const sizeZ = config.sizeZ;
  const s = config.cellSize;
  const solidIds = new Set(tilesOut.filter((tile) => tile.solid).map((tile) => tile.id));

  const isSolid = (x: number, y: number, z: number) => {
    if (x < 0 || y < 0 || z < 0 || x >= sizeX || y >= sizeY || z >= sizeZ) return false;
    return solidIds.has(tilesOut[indexOf(x, y, z, sizeX, sizeY)].id);
  };

  const faces: Face[] = [];

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
          faces.push({ normal: [1, 0, 0], vertices: [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]] });
        }
        if (!isSolid(x - 1, y, z)) {
          faces.push({ normal: [-1, 0, 0], vertices: [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]] });
        }
        if (!isSolid(x, y + 1, z)) {
          faces.push({ normal: [0, 1, 0], vertices: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]] });
        }
        if (!isSolid(x, y - 1, z)) {
          faces.push({ normal: [0, -1, 0], vertices: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]] });
        }
        if (!isSolid(x, y, z + 1)) {
          faces.push({ normal: [0, 0, 1], vertices: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] });
        }
        if (!isSolid(x, y, z - 1)) {
          faces.push({ normal: [0, 0, -1], vertices: [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]] });
        }
      }
    }
  }

  return faces;
};

const buildGeometry = (faces: Face[]) => {
  const positions: number[] = [];
  const normals: number[] = [];

  for (const face of faces) {
    const [a, b, c, d] = face.vertices;
    const n = face.normal;
    positions.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let i = 0; i < 6; i += 1) normals.push(...n);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.computeBoundingSphere();
  return geometry;
};

const rebuildMesh = () => {
  group.clear();
  currentFaces = buildFaces(currentTiles, currentConfig);
  const geometry = buildGeometry(currentFaces);
  geometry.center();
  const material = new THREE.MeshStandardMaterial({
    color: 0xd9c9a6,
    roughness: 0.7,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);
};

const generate = () => {
  currentConfig = readConfig();
  setStatus("Generating...");
  const grid = runWfc(currentConfig, tiles);
  let tilesOut = collapseToTiles(grid, tiles);
  tilesOut = applyGravity(tilesOut, currentConfig, tiles);
  currentTiles = tilesOut;
  rebuildMesh();
  setStatus(`Ready. Seed ${currentConfig.seed}`);
};

const render = () => {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

const voxelToStl = (faces: Face[]) => {
  const triangles: string[] = [];
  const addTri = (n: [number, number, number], a: number[], b: number[], c: number[]) => {
    triangles.push(
      `facet normal ${n[0]} ${n[1]} ${n[2]}\n` +
        `  outer loop\n` +
        `    vertex ${a[0]} ${a[1]} ${a[2]}\n` +
        `    vertex ${b[0]} ${b[1]} ${b[2]}\n` +
        `    vertex ${c[0]} ${c[1]} ${c[2]}\n` +
        `  endloop\n` +
        `endfacet`
    );
  };
  for (const face of faces) {
    const [a, b, c, d] = face.vertices;
    addTri(face.normal, a, b, c);
    addTri(face.normal, a, c, d);
  }
  return `solid wfc\n${triangles.join("\n")}\nendsolid wfc\n`;
};

const project = (point: THREE.Vector3, width: number, height: number) => {
  const v = point.clone().project(camera);
  return {
    x: (v.x * 0.5 + 0.5) * width,
    y: (1 - (v.y * 0.5 + 0.5)) * height,
  };
};

const buildEdges = () => {
  const edgeSet = new Set<string>();
  const edges: [[number, number, number], [number, number, number]][] = [];
  for (const face of currentFaces) {
    const v = face.vertices;
    for (let i = 0; i < 4; i += 1) {
      const a = v[i];
      const b = v[(i + 1) % 4];
      const key = `${a.join(",")}|${b.join(",")}`;
      const alt = `${b.join(",")}|${a.join(",")}`;
      if (edgeSet.has(key) || edgeSet.has(alt)) continue;
      edgeSet.add(key);
      edges.push([a, b]);
    }
  }
  return edges;
};

const drawPencilLine = (ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, jitter: number) => {
  const passes = 3;
  for (let i = 0; i < passes; i += 1) {
    const offset = (Math.random() - 0.5) * jitter;
    const angle = Math.atan2(by - ay, bx - ax) + Math.PI / 2;
    const ox = Math.cos(angle) * offset;
    const oy = Math.sin(angle) * offset;
    ctx.beginPath();
    ctx.moveTo(ax + ox, ay + oy);
    ctx.lineTo(bx + ox, by + oy);
    ctx.stroke();
  }
};

const exportSvg = async () => {
  const size = Number(ui.pngSize.value);
  const edges = buildEdges();
  const lines: string[] = [];
  for (const [a, b] of edges) {
    const p1 = project(new THREE.Vector3(...a), size, size);
    const p2 = project(new THREE.Vector3(...b), size, size);
    lines.push(`<line x1="${p1.x.toFixed(2)}" y1="${p1.y.toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${p2.y.toFixed(2)}" />`);
  }
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" stroke="#000" stroke-width="${ui.strokeWeight.value}">\n${lines.join("\n")}\n</svg>\n`;
  await window.api.saveFile({
    data: svg,
    encoding: "utf8",
    suggestedName: "wfc_sculpture.svg",
    filters: [{ name: "SVG", extensions: ["svg"] }],
  });
};

const exportPng = async () => {
  const size = Number(ui.pngSize.value);
  const weight = Number(ui.strokeWeight.value);
  const jitter = Number(ui.strokeJitter.value);
  const edges = buildEdges();
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#faf7f0";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#1b1b1b";
  ctx.lineWidth = weight;
  ctx.globalAlpha = 0.45;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const [a, b] of edges) {
    const p1 = project(new THREE.Vector3(...a), size, size);
    const p2 = project(new THREE.Vector3(...b), size, size);
    drawPencilLine(ctx, p1.x, p1.y, p2.x, p2.y, jitter);
  }

  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];
  await window.api.saveFile({
    data: base64,
    encoding: "base64",
    suggestedName: "wfc_sculpture.png",
    filters: [{ name: "PNG", extensions: ["png"] }],
  });
};

const exportStl = async () => {
  const stl = voxelToStl(currentFaces);
  await window.api.saveFile({
    data: stl,
    encoding: "utf8",
    suggestedName: "wfc_sculpture.stl",
    filters: [{ name: "STL", extensions: ["stl"] }],
  });
};

ui.generate.addEventListener("click", generate);
ui.exportStl.addEventListener("click", exportStl);
ui.exportSvg.addEventListener("click", exportSvg);
ui.exportPng.addEventListener("click", exportPng);

resize();
generate();
render();
