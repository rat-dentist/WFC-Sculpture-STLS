import * as THREE from "three";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createTileSet, defaultConfig, type Config, type Tile } from "@core/sketch";

type Face = {
  normal: [number, number, number];
  vertices: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]];
};

const ui = {
  canvas: document.getElementById("preview") as HTMLCanvasElement,
  status: document.getElementById("status") as HTMLDivElement,
  generate: document.getElementById("btn-generate") as HTMLButtonElement,
  randomize: document.getElementById("btn-randomize") as HTMLButtonElement,
  exportStl: document.getElementById("btn-stl") as HTMLButtonElement,
  exportPng: document.getElementById("btn-png") as HTMLButtonElement,
  exportSvg: document.getElementById("btn-svg") as HTMLButtonElement,
  previewModal: document.getElementById("preview-modal") as HTMLDivElement,
  previewTitle: document.getElementById("preview-title") as HTMLDivElement,
  previewBody: document.getElementById("preview-body") as HTMLDivElement,
  previewClose: document.getElementById("preview-close") as HTMLButtonElement,
  previewExport: document.getElementById("preview-export") as HTMLButtonElement,
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
const airTile = tiles.find((tile) => tile.name === "air") ?? tiles[0];
const solidTile = tiles.find((tile) => tile.name === "solid") ?? tiles.find((tile) => tile.solid) ?? tiles[0];
let currentTiles: Tile[] = [];
let currentConfig: Config = { ...defaultConfig };
let currentFaces: Face[] = [];
const buttonLabels = new Map<HTMLButtonElement, string>();
let currentPreview: "stl" | "png" | "svg" | null = null;

const renderer = new THREE.WebGLRenderer({ canvas: ui.canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0b0b0a);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b0b0a, 20, 160);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
camera.position.set(34, 26, 34);

const controls = new OrbitControls(camera, ui.canvas);
controls.enableDamping = true;

const lightA = new THREE.DirectionalLight(0xffffff, 1.0);
lightA.position.set(20, 40, 20);
const lightB = new THREE.DirectionalLight(0xffffff, 0.35);
lightB.position.set(-20, 10, -10);
const ambient = new THREE.AmbientLight(0xffffff, 0.25);
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

const setBusy = (busy: boolean) => {
  document.body.classList.toggle("busy", busy);
  for (const button of [ui.generate, ui.randomize, ui.exportStl, ui.exportPng, ui.exportSvg]) {
    if (!buttonLabels.has(button)) buttonLabels.set(button, button.textContent ?? "");
    button.disabled = busy;
  }
  if (busy) {
    ui.generate.textContent = "Generating...";
  } else {
    ui.generate.textContent = buttonLabels.get(ui.generate) ?? "Generate";
  }
};

window.addEventListener("error", (event) => {
  const message = event.error instanceof Error ? event.error.message : event.message;
  setStatus(`Error: ${message}`);
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
  setStatus(`Error: ${reason}`);
});

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

const seededRandom = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

type Axis = "x" | "y" | "z";
type Segment = {
  axis: Axis;
  dir: 1 | -1;
  length: number;
  thickness: number;
  start: [number, number, number];
};

const indexOf = (x: number, y: number, z: number, sizeX: number, sizeY: number) => x + y * sizeX + z * sizeX * sizeY;

const inBounds = (x: number, y: number, z: number, sizeX: number, sizeY: number, sizeZ: number) =>
  x >= 0 && y >= 0 && z >= 0 && x < sizeX && y < sizeY && z < sizeZ;

const randInt = (rng: () => number, min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

const offsetRange = (thickness: number) => {
  const min = -Math.floor((thickness - 1) / 2);
  const max = Math.ceil((thickness - 1) / 2);
  return { min, max };
};

const fillSegment = (grid: Uint8Array, segment: Segment, sizeX: number, sizeY: number, sizeZ: number) => {
  const { axis, dir, length, thickness, start } = segment;
  const [sx, sy, sz] = start;
  const { min, max } = offsetRange(thickness);

  for (let i = 0; i < length; i += 1) {
    const x = axis === "x" ? sx + dir * i : sx;
    const y = axis === "y" ? sy + dir * i : sy;
    const z = axis === "z" ? sz + dir * i : sz;

    for (let a = min; a <= max; a += 1) {
      for (let b = min; b <= max; b += 1) {
        let vx = x;
        let vy = y;
        let vz = z;
        if (axis === "x") {
          vy += a;
          vz += b;
        } else if (axis === "y") {
          vx += a;
          vz += b;
        } else {
          vx += a;
          vy += b;
        }
        if (!inBounds(vx, vy, vz, sizeX, sizeY, sizeZ)) continue;
        grid[indexOf(vx, vy, vz, sizeX, sizeY)] = 1;
      }
    }
  }
};

const generateBranching = (config: Config) => {
  const rng = seededRandom(config.seed || 1);
  const sizeX = config.sizeX;
  const sizeY = config.sizeY;
  const sizeZ = config.sizeZ;
  const grid = new Uint8Array(sizeX * sizeY * sizeZ);

  const centerX = Math.floor(sizeX / 2);
  const centerZ = Math.floor(sizeZ / 2);
  const baseThickness = Math.max(2, Math.min(6, Math.floor(Math.min(sizeX, sizeZ) / 6)));
  const margin = config.boundaryAir ? 1 : 0;
  const trunkLen = Math.max(6, sizeY - margin * 2);
  const startY = margin;

  const segments: Segment[] = [
    {
      axis: "y",
      dir: 1,
      length: trunkLen,
      thickness: baseThickness,
      start: [centerX, startY, centerZ],
    },
  ];

  const pivotY = Math.min(sizeY - 1 - margin, startY + Math.floor(trunkLen * 0.55));
  const tLen = Math.max(4, Math.floor(Math.min(sizeX, sizeZ) * 0.35));
  segments.push({ axis: "x", dir: 1, length: tLen, thickness: baseThickness, start: [centerX, pivotY, centerZ] });
  segments.push({ axis: "x", dir: -1, length: tLen, thickness: baseThickness, start: [centerX, pivotY, centerZ] });
  if (rng() > 0.4) {
    const zLen = Math.max(4, Math.floor(Math.min(sizeX, sizeZ) * 0.28));
    segments.push({ axis: "z", dir: 1, length: zLen, thickness: Math.max(1, baseThickness - 1), start: [centerX, pivotY, centerZ] });
  }

  const extraBranchFactor = config.settleGravity ? 1 : 0;
  const maxSegments = Math.min(64, Math.max(10, Math.floor((sizeX + sizeY + sizeZ) / 1.4) + extraBranchFactor * 10));

  for (let i = 0; i < segments.length && segments.length < maxSegments; i += 1) {
    const seg = segments[i];
    if (seg.length < 6) continue;
    const branchCount =
      seg.axis === "y"
        ? randInt(rng, 1, 2 + extraBranchFactor)
        : randInt(rng, 0, 1 + extraBranchFactor);
    for (let b = 0; b < branchCount && segments.length < maxSegments; b += 1) {
      const pivotOffset = randInt(rng, 2, Math.max(2, seg.length - 3));
      const px = seg.axis === "x" ? seg.start[0] + seg.dir * pivotOffset : seg.start[0];
      const py = seg.axis === "y" ? seg.start[1] + seg.dir * pivotOffset : seg.start[1];
      const pz = seg.axis === "z" ? seg.start[2] + seg.dir * pivotOffset : seg.start[2];

      const axes: Axis[] = seg.axis === "x" ? ["y", "z"] : seg.axis === "y" ? ["x", "z"] : ["x", "y"];
      const axis = axes[randInt(rng, 0, axes.length - 1)];
      const dir = rng() > 0.5 ? 1 : -1;
      const length = Math.max(3, Math.floor(seg.length * (0.45 + rng() * 0.35)));
      const thickness = Math.max(1, Math.floor(seg.thickness * (0.65 + rng() * 0.2)));

      segments.push({
        axis,
        dir,
        length,
        thickness,
        start: [px, py, pz],
      });
    }
  }

  for (const segment of segments) {
    fillSegment(grid, segment, sizeX, sizeY, sizeZ);
  }

  return grid;
};

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
  if (currentFaces.length === 0) {
    const solidCount = currentTiles.filter((tile) => tile.solid).length;
    setStatus(`No solid faces. Solids: ${solidCount}. Try a new seed or smaller grid.`);
    return;
  }
  const geometry = buildGeometry(currentFaces);
  geometry.center();
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.65,
    metalness: 0.0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 1.6 + 10;
  camera.near = Math.max(0.1, distance / 100);
  camera.far = distance * 10;
  camera.position.set(center.x + distance, center.y + distance * 0.6, center.z + distance);
  camera.lookAt(center);
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.update();
};

const generate = () => {
  setBusy(true);
  setStatus("Generating...");
  // Let the UI paint the busy state before heavy work.
  setTimeout(() => {
    try {
      currentConfig = readConfig();
      const grid = generateBranching(currentConfig);
      currentTiles = Array.from(grid, (value) => (value ? solidTile : airTile));
      rebuildMesh();
      const solidCount = currentTiles.filter((tile) => tile.solid).length;
      setStatus(`Ready. Seed ${currentConfig.seed} | Solids ${solidCount} | Faces ${currentFaces.length}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(error);
      setStatus(`Error: ${message}`);
    } finally {
      setBusy(false);
    }
  }, 20);
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value)); = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, step: number) => {
  const span = max - min;
  const steps = Math.max(1, Math.round(span / step));
  const value = min + randomInt(0, steps) * step;
  return Number(clamp(value, min, max).toFixed(3));
};

const randomize = () => {
  const randIntInput = (input: HTMLInputElement) => {
    const min = Number(input.min || "0");
    const max = Number(input.max || "100");
    input.value = String(randomInt(min, max));
  };
  const randFloatInput = (input: HTMLInputElement) => {
    const min = Number(input.min || "0");
    const max = Number(input.max || "1");
    const step = Number(input.step || "0.1");
    input.value = String(randomFloat(min, max, step));
  };

  randIntInput(ui.sizeX);
  randIntInput(ui.sizeY);
  randIntInput(ui.sizeZ);
  randFloatInput(ui.cellSize);
  ui.seed.value = String(randomInt(1, 999999));
  ui.boundaryAir.checked = Math.random() > 0.25;
  ui.gravity.checked = Math.random() > 0.2;
  randIntInput(ui.pngSize);
  randFloatInput(ui.strokeWeight);
  randFloatInput(ui.strokeJitter);

  generate();
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
  return `solid branching\n${triangles.join("\n")}\nendsolid branching\n`;
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

const buildSvgMarkup = (includeHeader = true) => {
  const size = Number(ui.pngSize.value);
  const edges = buildEdges();
  const lines: string[] = [];
  for (const [a, b] of edges) {
    const p1 = project(new THREE.Vector3(...a), size, size);
    const p2 = project(new THREE.Vector3(...b), size, size);
    lines.push(`<line x1="${p1.x.toFixed(2)}" y1="${p1.y.toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${p2.y.toFixed(2)}" />`);
  }
  const header = includeHeader ? `<?xml version="1.0" encoding="UTF-8"?>\n` : "";
  return `${header}<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" stroke="#000" stroke-width="${ui.strokeWeight.value}">\n${lines.join("\n")}\n</svg>\n`;
};

const buildPngCanvas = () => {
  const size = Number(ui.pngSize.value);
  const weight = Number(ui.strokeWeight.value);
  const jitter = Number(ui.strokeJitter.value);
  const edges = buildEdges();
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
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

  return canvas;
};

const exportSvg = async () => {
  const svg = buildSvgMarkup(true);
  await window.api.saveFile({
    data: svg,
    encoding: "utf8",
    suggestedName: "branching_sculpture.svg",
    filters: [{ name: "SVG", extensions: ["svg"] }],
  });
};

const exportPng = async () => {
  const canvas = buildPngCanvas();
  if (!canvas) return;
  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];
  await window.api.saveFile({
    data: base64,
    encoding: "base64",
    suggestedName: "branching_sculpture.png",
    filters: [{ name: "PNG", extensions: ["png"] }],
  });
};

const exportStl = async () => {
  const stl = voxelToStl(currentFaces);
  await window.api.saveFile({
    data: stl,
    encoding: "utf8",
    suggestedName: "branching_sculpture.stl",
    filters: [{ name: "STL", extensions: ["stl"] }],
  });
};

const openPreview = (type: "stl" | "png" | "svg") => {
  if (currentFaces.length === 0) {
    setStatus("Nothing to preview. Generate first.");
    return;
  }
  currentPreview = type;
  ui.previewTitle.textContent = `${type.toUpperCase()} Preview`;
  ui.previewExport.textContent = `Export ${type.toUpperCase()}`;
  ui.previewBody.innerHTML = "";
  ui.previewModal.classList.remove("hidden");

  if (type === "png") {
    const canvas = buildPngCanvas();
    if (canvas) ui.previewBody.appendChild(canvas);
    return;
  }

  if (type === "svg") {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildSvgMarkup(false);
    const svg = wrapper.querySelector("svg");
    if (svg) ui.previewBody.appendChild(svg);
    return;
  }

  const img = new Image();
  img.src = renderer.domElement.toDataURL("image/png");
  ui.previewBody.appendChild(img);
  const meta = document.createElement("div");
  meta.className = "preview-meta";
  meta.textContent = `Faces ${currentFaces.length} | Triangles ${currentFaces.length * 2}`;
  ui.previewBody.appendChild(meta);
};

const closePreview = () => {
  ui.previewModal.classList.add("hidden");
  currentPreview = null;
};

const exportPreview = async () => {
  if (!currentPreview) return;
  if (currentPreview === "png") await exportPng();
  if (currentPreview === "svg") await exportSvg();
  if (currentPreview === "stl") await exportStl();
  closePreview();
};

ui.generate.addEventListener("click", generate);
ui.randomize.addEventListener("click", randomize);
ui.exportStl.addEventListener("click", () => openPreview("stl"));
ui.exportSvg.addEventListener("click", () => openPreview("svg"));
ui.exportPng.addEventListener("click", () => openPreview("png"));
ui.previewClose.addEventListener("click", closePreview);
ui.previewExport.addEventListener("click", exportPreview);
ui.previewModal.addEventListener("click", (event) => {
  if (event.target === ui.previewModal) closePreview();
});

resize();
generate();
render();



