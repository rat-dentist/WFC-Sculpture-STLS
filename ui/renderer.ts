import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createTileSet, defaultConfig, type Config, type Tile } from "@core/sketch";
import { applyGravity, collapseToTiles, runWfc } from "@core/wfc3d";

type Face = {
  normal: [number, number, number];
  vertices: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]];
};

const ui = {
  canvas: document.getElementById("preview") as HTMLCanvasElement,
  depthCanvas: document.getElementById("depth-canvas") as HTMLCanvasElement,
  status: document.getElementById("status") as HTMLDivElement,
  generate: document.getElementById("btn-generate") as HTMLButtonElement,
  texture: document.getElementById("btn-texture") as HTMLButtonElement,
  export: document.getElementById("btn-export") as HTMLButtonElement,
  depthApply: document.getElementById("depth-apply") as HTMLButtonElement,
  textureInput: document.getElementById("texture-input") as HTMLInputElement,
  modelMode: document.getElementById("model-mode") as HTMLSelectElement,
  branchDensityControl: document.getElementById("branch-density-control") as HTMLElement,
  thicknessControl: document.getElementById("thickness-control") as HTMLElement,
  branchStyleControl: document.getElementById("branch-style-control") as HTMLElement,
  branchComplexityControl: document.getElementById("branch-complexity-control") as HTMLElement,
  branchVariationControl: document.getElementById("branch-variation-control") as HTMLElement,
  branchProjectionControl: document.getElementById("branch-projection-control") as HTMLElement,
  branchDensity: document.getElementById("branch-density") as HTMLInputElement,
  branchDensityValue: document.getElementById("branch-density-value") as HTMLSpanElement,
  thickness: document.getElementById("thickness") as HTMLInputElement,
  thicknessValue: document.getElementById("thickness-value") as HTMLSpanElement,
  branchStyle: document.getElementById("branch-style") as HTMLSelectElement,
  branchComplexity: document.getElementById("branch-complexity") as HTMLInputElement,
  branchComplexityValue: document.getElementById("branch-complexity-value") as HTMLSpanElement,
  branchVariation: document.getElementById("branch-variation") as HTMLInputElement,
  branchVariationValue: document.getElementById("branch-variation-value") as HTMLSpanElement,
  branchProjection: document.getElementById("branch-projection") as HTMLSelectElement,
  showTexture: document.getElementById("show-texture") as HTMLInputElement,
  etchSizeControl: document.getElementById("etch-size-control") as HTMLElement,
  etchGainControl: document.getElementById("etch-gain-control") as HTMLElement,
  etchMarginControl: document.getElementById("etch-margin-control") as HTMLElement,
  etchResolutionControl: document.getElementById("etch-resolution-control") as HTMLElement,
  etchFacesControl: document.getElementById("etch-faces-control") as HTMLElement,
  etchWrapControl: document.getElementById("etch-wrap-control") as HTMLElement,
  etchRotateControl: document.getElementById("etch-rotate-control") as HTMLElement,
  etchFlipXControl: document.getElementById("etch-flipx-control") as HTMLElement,
  etchFlipYControl: document.getElementById("etch-flipy-control") as HTMLElement,
  etchSize: document.getElementById("etch-size") as HTMLInputElement,
  etchSizeValue: document.getElementById("etch-size-value") as HTMLSpanElement,
  etchGain: document.getElementById("etch-gain") as HTMLInputElement,
  etchGainValue: document.getElementById("etch-gain-value") as HTMLSpanElement,
  etchMargin: document.getElementById("etch-margin") as HTMLInputElement,
  etchMarginValue: document.getElementById("etch-margin-value") as HTMLSpanElement,
  etchResolution: document.getElementById("etch-resolution") as HTMLInputElement,
  etchResolutionValue: document.getElementById("etch-resolution-value") as HTMLSpanElement,
  etchAllFaces: document.getElementById("etch-all-faces") as HTMLInputElement,
  etchWrap: document.getElementById("etch-wrap") as HTMLSelectElement,
  etchRotation: document.getElementById("etch-rotation") as HTMLSelectElement,
  etchFlipX: document.getElementById("etch-flip-x") as HTMLInputElement,
  etchFlipY: document.getElementById("etch-flip-y") as HTMLInputElement,
  carveDepth: document.getElementById("carve-depth") as HTMLInputElement,
  carveLow: document.getElementById("carve-low") as HTMLInputElement,
  carveHigh: document.getElementById("carve-high") as HTMLInputElement,
  carveDepthValue: document.getElementById("carve-depth-value") as HTMLSpanElement,
  carveLowValue: document.getElementById("carve-low-value") as HTMLSpanElement,
  carveHighValue: document.getElementById("carve-high-value") as HTMLSpanElement,
  depthBlur: document.getElementById("depth-blur") as HTMLInputElement,
  depthBlurValue: document.getElementById("depth-blur-value") as HTMLSpanElement,
  depthGamma: document.getElementById("depth-gamma") as HTMLInputElement,
  depthGammaValue: document.getElementById("depth-gamma-value") as HTMLSpanElement,
  depthContrast: document.getElementById("depth-contrast") as HTMLInputElement,
  depthContrastValue: document.getElementById("depth-contrast-value") as HTMLSpanElement,
  depthRelief: document.getElementById("depth-relief") as HTMLInputElement,
  depthReliefValue: document.getElementById("depth-relief-value") as HTMLSpanElement,
  depthMidtone: document.getElementById("depth-midtone") as HTMLInputElement,
  depthMidtoneValue: document.getElementById("depth-midtone-value") as HTMLSpanElement,
  depthHighpass: document.getElementById("depth-highpass") as HTMLInputElement,
  depthHighpassValue: document.getElementById("depth-highpass-value") as HTMLSpanElement,
  depthPosterize: document.getElementById("depth-posterize") as HTMLInputElement,
  depthPosterizeValue: document.getElementById("depth-posterize-value") as HTMLSpanElement,
  detailEmboss: document.getElementById("detail-emboss") as HTMLInputElement,
  depthInvert: document.getElementById("depth-invert") as HTMLInputElement,
  depthSmooth: document.getElementById("depth-smooth") as HTMLInputElement,
  depthRaking: document.getElementById("depth-raking") as HTMLInputElement,
  depthLightAngle: document.getElementById("depth-light-angle") as HTMLInputElement,
  depthLightAngleValue: document.getElementById("depth-light-angle-value") as HTMLSpanElement,
  depthLive: document.getElementById("depth-live") as HTMLInputElement,
  depthPreview: document.getElementById("depth-preview") as HTMLInputElement,
};

const tiles = createTileSet();
const airTile = tiles.find((tile) => tile.name === "air") ?? tiles[0];
const solidTile = tiles.find((tile) => tile.name === "solid") ?? tiles.find((tile) => tile.solid) ?? tiles[0];
let currentTiles: Tile[] = [];
let currentConfig: Config = { ...defaultConfig };
let currentFaces: Face[] = [];
let currentGeometry: THREE.BufferGeometry | null = null;
const buttonLabels = new Map<HTMLButtonElement, string>();
let baseGrid: Uint8Array | null = null;
let isGenerating = false;
let userHasMovedCamera = false;
let suppressCameraEvents = false;
let lastCameraState: { position: THREE.Vector3; target: THREE.Vector3 } | null = null;
let modelScale = 1;
const targetSizeMM = 250;

type HeightMap = {
  width: number;
  height: number;
  values: Float32Array;
};

let activeHeightMapRaw: HeightMap | null = null;
let activeHeightMapProcessed: HeightMap | null = null;
let activeHeightMapSmoothed: HeightMap | null = null;
let activeTexture: THREE.Texture | null = null;
let activeDepthPreviewTexture: THREE.Texture | null = null;
let activeDepthStudioTexture: THREE.Texture | null = null;

const renderer = new THREE.WebGLRenderer({ canvas: ui.canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x2b2d31);

const depthRenderer = new THREE.WebGLRenderer({ canvas: ui.depthCanvas, antialias: true, alpha: true });
depthRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
depthRenderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x2b2d31, 80, 420);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
camera.position.set(34, 26, 34);

const controls = new OrbitControls(camera, ui.canvas);
controls.enableDamping = true;
controls.addEventListener("change", () => {
  if (suppressCameraEvents) return;
  userHasMovedCamera = true;
  if (!lastCameraState) {
    lastCameraState = { position: new THREE.Vector3(), target: new THREE.Vector3() };
  }
  lastCameraState.position.copy(camera.position);
  lastCameraState.target.copy(controls.target);
});

const lightA = new THREE.DirectionalLight(0xffffff, 1.1);
lightA.position.set(18, 36, 22);
const lightB = new THREE.DirectionalLight(0xffffff, 0.45);
lightB.position.set(-18, 10, -8);
const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(lightA, lightB, ambient);

const group = new THREE.Group();
scene.add(group);

const depthScene = new THREE.Scene();
const depthCamera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
depthCamera.position.set(9, 7.2, 9);
depthCamera.lookAt(0, 0, 0);
const depthLightA = new THREE.DirectionalLight(0xffffff, 0.9);
depthLightA.position.set(8, 10, 6);
const depthLightB = new THREE.DirectionalLight(0xffffff, 0.35);
depthLightB.position.set(-6, 4, -4);
const depthAmbient = new THREE.AmbientLight(0xffffff, 0.25);
depthScene.add(depthLightA, depthLightB, depthAmbient);

const updateDepthPreviewLighting = () => {
  const angle = THREE.MathUtils.degToRad(Number(ui.depthLightAngle.value));
  const raking = ui.depthRaking.checked;
  const radius = 12;
  const lightY = raking ? 2.4 : 9;
  depthLightA.position.set(Math.cos(angle) * radius, lightY, Math.sin(angle) * radius);
  depthLightA.intensity = raking ? 1.25 : 0.9;
  depthLightB.intensity = raking ? 0.12 : 0.35;
  depthAmbient.intensity = raking ? 0.12 : 0.25;
};

const sharedMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.6,
  metalness: 0.0,
  side: THREE.DoubleSide,
});

const depthMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.7,
  metalness: 0.0,
  side: THREE.DoubleSide,
});
const depthPlane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 128, 128), depthMaterial);
depthPlane.rotation.x = -Math.PI / 5.5;
depthPlane.position.y = -0.5;
depthScene.add(depthPlane);

const resize = () => {
  const { clientWidth, clientHeight } = ui.canvas;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();

  const depthWidth = ui.depthCanvas.clientWidth;
  const depthHeight = ui.depthCanvas.clientHeight;
  if (depthWidth > 0 && depthHeight > 0) {
    depthRenderer.setSize(depthWidth, depthHeight, false);
    depthCamera.aspect = depthWidth / depthHeight;
    depthCamera.updateProjectionMatrix();
  }
};

window.addEventListener("resize", resize);

const setStatus = (message: string) => {
  ui.status.textContent = message;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

type DetailMode = "carve" | "emboss";
type ModelMode = "branching" | "etch" | "wfc";
type BranchStyle = "balanced" | "stacked" | "cantilever" | "crown";
type BranchProjection = "triplanar" | "dominant" | "planar" | "cylindrical";

const getDetailMode = (): DetailMode => (ui.detailEmboss.checked ? "emboss" : "carve");
const getModelMode = (): ModelMode => {
  if (ui.modelMode.value === "etch") return "etch";
  if (ui.modelMode.value === "wfc") return "wfc";
  return "branching";
};

const getEtchSettings = () => ({
  cubeSizeMm: Number(ui.etchSize.value),
  marginMm: Number(ui.etchMargin.value),
  resolution: Number(ui.etchResolution.value),
  depthGain: Number(ui.etchGain.value),
  allFaces: ui.etchAllFaces.checked,
  wrapMode: ui.etchWrap.value === "sides" ? "sides" : "face",
  rotation: Number(ui.etchRotation.value),
  flipX: ui.etchFlipX.checked,
  flipY: ui.etchFlipY.checked,
});

const getBranchProjection = (): BranchProjection => {
  const value = ui.branchProjection.value as BranchProjection;
  return value || "triplanar";
};

const updateModeUI = () => {
  const mode = getModelMode();
  const etchMode = mode === "etch";
  const branchingMode = mode === "branching";
  ui.branchDensityControl.classList.toggle("hidden", !branchingMode);
  ui.thicknessControl.classList.toggle("hidden", !branchingMode);
  ui.branchStyleControl.classList.toggle("hidden", !branchingMode);
  ui.branchComplexityControl.classList.toggle("hidden", !branchingMode);
  ui.branchVariationControl.classList.toggle("hidden", !branchingMode);
  ui.branchProjectionControl.classList.toggle("hidden", etchMode);
  ui.etchSizeControl.classList.toggle("hidden", !etchMode);
  ui.etchGainControl.classList.toggle("hidden", !etchMode);
  ui.etchMarginControl.classList.toggle("hidden", !etchMode);
  ui.etchResolutionControl.classList.toggle("hidden", !etchMode);
  ui.etchWrapControl.classList.toggle("hidden", !etchMode);
  ui.etchFacesControl.classList.toggle("hidden", !etchMode);
  ui.etchRotateControl.classList.toggle("hidden", !etchMode);
  ui.etchFlipXControl.classList.toggle("hidden", !etchMode);
  ui.etchFlipYControl.classList.toggle("hidden", !etchMode);
};

const getCarveSettings = () => {
  const maxDepth = Number(ui.carveDepth.value);
  let low = Number(ui.carveLow.value) / 100;
  let high = Number(ui.carveHigh.value) / 100;
  if (low > high - 0.01) {
    if (low >= 0.99) {
      low = 0.98;
      high = 0.99;
    } else {
      high = low + 0.01;
    }
  }
  return {
    maxDepth: Math.max(0, Math.min(4, maxDepth)),
    low,
    high,
  };
};

const updateControlLabels = () => {
  ui.branchDensityValue.textContent = ui.branchDensity.value;
  ui.thicknessValue.textContent = ui.thickness.value;
  ui.branchComplexityValue.textContent = ui.branchComplexity.value;
  ui.branchVariationValue.textContent = ui.branchVariation.value;
  ui.etchSizeValue.textContent = ui.etchSize.value;
  ui.etchGainValue.textContent = Number(ui.etchGain.value).toFixed(1);
  ui.etchMarginValue.textContent = Number(ui.etchMargin.value).toFixed(1);
  ui.etchResolutionValue.textContent = ui.etchResolution.value;
  ui.carveDepthValue.textContent = Number(ui.carveDepth.value).toFixed(1);
  ui.carveLowValue.textContent = ui.carveLow.value;
  ui.carveHighValue.textContent = ui.carveHigh.value;
  ui.depthBlurValue.textContent = Number(ui.depthBlur.value).toFixed(1);
  ui.depthGammaValue.textContent = Number(ui.depthGamma.value).toFixed(2);
  ui.depthContrastValue.textContent = ui.depthContrast.value;
  ui.depthReliefValue.textContent = ui.depthRelief.value;
  ui.depthMidtoneValue.textContent = ui.depthMidtone.value;
  ui.depthHighpassValue.textContent = ui.depthHighpass.value;
  ui.depthPosterizeValue.textContent = ui.depthPosterize.value;
  ui.depthLightAngleValue.textContent = String(Math.round(Number(ui.depthLightAngle.value)));
};

const extractHeightMap = (image: HTMLImageElement): HeightMap => {
  const maxDim = 1024;
  const scale = Math.min(1, maxDim / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { width: 1, height: 1, values: new Float32Array([0.5]) };
  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  const values = new Float32Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    const p = i * 4;
    const r = data[p] / 255;
    const g = data[p + 1] / 255;
    const b = data[p + 2] / 255;
    values[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  return { width, height, values };
};

const sampleHeightMap = (map: HeightMap, u: number, v: number) => {
  const uu = clamp01(u);
  const vv = clamp01(v);
  const x = uu * (map.width - 1);
  const y = vv * (map.height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(map.width - 1, x0 + 1);
  const y1 = Math.min(map.height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;

  const p00 = map.values[x0 + y0 * map.width];
  const p10 = map.values[x1 + y0 * map.width];
  const p01 = map.values[x0 + y1 * map.width];
  const p11 = map.values[x1 + y1 * map.width];

  const a = p00 * (1 - tx) + p10 * tx;
  const b = p01 * (1 - tx) + p11 * tx;
  return a * (1 - ty) + b * ty;
};

const blurValues = (values: Float32Array, width: number, height: number, radius: number) => {
  if (radius <= 0) return values;
  const r = Math.max(1, Math.round(radius));
  const temp = new Float32Array(values.length);
  const out = new Float32Array(values.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let count = 0;
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(width - 1, x + r);
      for (let xx = x0; xx <= x1; xx += 1) {
        sum += values[xx + y * width];
        count += 1;
      }
      temp[x + y * width] = sum / count;
    }
  }

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      let sum = 0;
      let count = 0;
      const y0 = Math.max(0, y - r);
      const y1 = Math.min(height - 1, y + r);
      for (let yy = y0; yy <= y1; yy += 1) {
        sum += temp[x + yy * width];
        count += 1;
      }
      out[x + y * width] = sum / count;
    }
  }

  return out;
};

const applyContrast = (value: number, contrast: number) => {
  if (contrast === 0) return value;
  const c = contrast * 2.55;
  const factor = (259 * (c + 255)) / (255 * (259 - c));
  return clamp01(factor * (value - 0.5) + 0.5);
};

const applyReliefCurve = (value: number, amount: number) => {
  if (Math.abs(amount) < 1e-6) return value;
  const power = amount >= 0 ? 1 + amount * 3 : 1 / (1 + -amount * 3);
  if (value < 0.5) return 0.5 * Math.pow(value * 2, power);
  return 1 - 0.5 * Math.pow((1 - value) * 2, power);
};

const applyMidtoneFocus = (value: number, focus: number) => {
  if (focus <= 0) return value;
  const centered = value - 0.5;
  const midWeight = 1 - Math.abs(centered) * 2;
  const edgeCompression = 1 - focus * (1 - clamp01(midWeight));
  return clamp01(0.5 + centered * edgeCompression);
};

const applyPosterize = (value: number, levels: number) => {
  if (levels < 2) return value;
  const maxLevel = levels - 1;
  return Math.round(value * maxLevel) / maxLevel;
};

const transformUv = (u: number, v: number, rotation: number, flipX: boolean, flipY: boolean) => {
  let uu = u;
  let vv = v;
  const rot = ((rotation % 360) + 360) % 360;
  if (rot === 90) {
    [uu, vv] = [vv, 1 - uu];
  } else if (rot === 180) {
    uu = 1 - uu;
    vv = 1 - vv;
  } else if (rot === 270) {
    [uu, vv] = [1 - vv, uu];
  }
  if (flipX) uu = 1 - uu;
  if (flipY) vv = 1 - vv;
  return [uu, vv];
};

const sampleHeightMapTransformed = (map: HeightMap, u: number, v: number, rotation: number, flipX: boolean, flipY: boolean) => {
  const [uu, vv] = transformUv(u, v, rotation, flipX, flipY);
  return sampleHeightMap(map, uu, vv);
};

const sampleWrappedUv = (pos: THREE.Vector3, cubeSize: number, rotation: number, flipX: boolean, flipY: boolean) => {
  const half = cubeSize * 0.5;
  const angle = Math.atan2(pos.z, pos.x);
  let u = angle / (Math.PI * 2) + 0.5;
  let v = (pos.y + half) / cubeSize;
  u = clamp01(u);
  v = clamp01(v);
  return transformUv(u, v, rotation, flipX, flipY);
};

const applyHighPassDetail = (values: Float32Array, width: number, height: number, amount: number) => {
  if (amount <= 0) return values;
  const low = blurValues(values, width, height, 2);
  const out = new Float32Array(values.length);
  for (let i = 0; i < values.length; i += 1) {
    const detail = values[i] - low[i];
    out[i] = clamp01(values[i] + detail * amount);
  }
  return out;
};

const edgePreserveSmooth = (values: Float32Array, width: number, height: number, iterations: number, sigmaRange: number) => {
  if (iterations <= 0) return values;
  let current = new Float32Array(values);
  const invSigma = 1 / Math.max(1e-5, sigmaRange * sigmaRange * 2);
  const kernel = [
    [0.075, -1, -1],
    [0.124, 0, -1],
    [0.075, 1, -1],
    [0.124, -1, 0],
    [0.204, 0, 0],
    [0.124, 1, 0],
    [0.075, -1, 1],
    [0.124, 0, 1],
    [0.075, 1, 1],
  ] as const;

  for (let iter = 0; iter < iterations; iter += 1) {
    const out = new Float32Array(current.length);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const center = current[x + y * width];
        let weighted = 0;
        let sumW = 0;
        for (const [spatial, ox, oy] of kernel) {
          const nx = Math.min(width - 1, Math.max(0, x + ox));
          const ny = Math.min(height - 1, Math.max(0, y + oy));
          const sample = current[nx + ny * width];
          const diff = sample - center;
          const rangeW = Math.exp(-(diff * diff) * invSigma);
          const w = spatial * rangeW;
          weighted += sample * w;
          sumW += w;
        }
        out[x + y * width] = sumW > 1e-6 ? weighted / sumW : center;
      }
    }
    current = out;
  }

  return current;
};

const buildProcessedHeightMap = () => {
  if (!activeHeightMapRaw) {
    activeHeightMapProcessed = null;
    activeHeightMapSmoothed = null;
    return;
  }

  const { width, height } = activeHeightMapRaw;
  const values = new Float32Array(activeHeightMapRaw.values.length);
  const { low, high } = getCarveSettings();
  const span = Math.max(1e-6, high - low);
  const gamma = Math.max(0.01, Number(ui.depthGamma.value));
  const contrast = Number(ui.depthContrast.value);
  const relief = Number(ui.depthRelief.value) / 100;
  const midtone = Number(ui.depthMidtone.value) / 100;
  const highPass = Number(ui.depthHighpass.value) / 100;
  const posterize = Number(ui.depthPosterize.value);
  const invert = ui.depthInvert.checked;

  for (let i = 0; i < values.length; i += 1) {
    let v = clamp01((activeHeightMapRaw.values[i] - low) / span);
    if (invert) v = 1 - v;
    v = Math.pow(v, 1 / gamma);
    v = applyContrast(v, contrast);
    v = applyReliefCurve(v, relief);
    v = applyMidtoneFocus(v, midtone);
    v = applyPosterize(v, posterize);
    values[i] = v;
  }

  const withHighPass = applyHighPassDetail(values, width, height, highPass);
  const blurRadius = Number(ui.depthBlur.value);
  const blurred = blurValues(withHighPass, width, height, blurRadius);
  activeHeightMapProcessed = { width, height, values: blurred };

  if (ui.depthSmooth.checked) {
    const etchMode = getModelMode() === "etch";
    const posterized = Number(ui.depthPosterize.value) > 0;
    // Keep hard edges for etching workflows while still reducing noise.
    const smoothed = etchMode && posterized ? edgePreserveSmooth(blurred, width, height, 1, 0.045) : edgePreserveSmooth(blurred, width, height, 2, 0.09);
    activeHeightMapSmoothed = { width, height, values: smoothed };
  } else {
    activeHeightMapSmoothed = null;
  }
};

const getActiveDetailMap = () => {
  if (ui.depthSmooth.checked && activeHeightMapSmoothed) return activeHeightMapSmoothed;
  return activeHeightMapProcessed;
};

const updateDepthStudioPreview = () => {
  const previewMap = getActiveDetailMap();
  if (!previewMap) {
    if (activeDepthStudioTexture) {
      activeDepthStudioTexture.dispose();
      activeDepthStudioTexture = null;
    }
    depthMaterial.displacementMap = null;
    depthMaterial.map = activeTexture;
    depthMaterial.needsUpdate = true;
    return;
  }

  const { width, height } = previewMap;
  const { rotation, flipX, flipY } = getEtchSettings();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const img = ctx.createImageData(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = width > 1 ? x / (width - 1) : 0.5;
      const v = height > 1 ? y / (height - 1) : 0.5;
      const tone = sampleHeightMapTransformed(previewMap, u, v, rotation, flipX, flipY);
      const vv = Math.round(tone * 255);
      const p = (x + y * width) * 4;
      img.data[p] = vv;
      img.data[p + 1] = vv;
      img.data[p + 2] = vv;
      img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  if (activeDepthStudioTexture) activeDepthStudioTexture.dispose();
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  activeDepthStudioTexture = tex;

  const { maxDepth } = getCarveSettings();
  const emboss = getDetailMode() === "emboss";
  depthMaterial.displacementMap = activeDepthStudioTexture;
  depthMaterial.displacementScale = maxDepth;
  depthMaterial.displacementBias = emboss ? 0 : -maxDepth;
  depthMaterial.map = activeTexture;
  depthMaterial.needsUpdate = true;
};

const updateMaterialPreview = () => {
  if (!ui.showTexture.checked) {
    sharedMaterial.map = null;
  } else if (ui.depthPreview.checked && activeDepthPreviewTexture) {
    sharedMaterial.map = activeDepthPreviewTexture;
  } else {
    sharedMaterial.map = activeTexture;
  }
  sharedMaterial.needsUpdate = true;
};

const buildDepthPreviewTexture = () => {
  const previewMap = getActiveDetailMap();
  if (!previewMap) {
    activeDepthPreviewTexture = null;
    updateMaterialPreview();
    return;
  }
  const width = previewMap.width;
  const height = previewMap.height;
  const { rotation, flipX, flipY } = getEtchSettings();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const img = ctx.createImageData(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = width > 1 ? x / (width - 1) : 0.5;
      const v = height > 1 ? y / (height - 1) : 0.5;
      const tone = sampleHeightMapTransformed(previewMap, u, v, rotation, flipX, flipY);
      const vv = Math.round(tone * 255);
      const p = (x + y * width) * 4;
      img.data[p] = vv;
      img.data[p + 1] = vv;
      img.data[p + 2] = vv;
      img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  if (activeDepthPreviewTexture) activeDepthPreviewTexture.dispose();
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  activeDepthPreviewTexture = tex;
  updateMaterialPreview();
};

const applyTexture = (url: string) => {
  const loader = new THREE.TextureLoader();
  loader.load(
    url,
    (texture) => {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(1, 1);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      if (activeTexture) activeTexture.dispose();
      activeTexture = texture;
      updateMaterialPreview();

      const image = new Image();
      image.onload = () => {
        activeHeightMapRaw = extractHeightMap(image);
        buildProcessedHeightMap();
        updateDepthStudioPreview();
        buildDepthPreviewTexture();
        if (ui.depthLive.checked && (baseGrid || getModelMode() === "etch")) applySurfaceDetail();
        setStatus("Texture and depth map applied.");
      };
      image.onerror = () => {
        activeHeightMapRaw = null;
        activeHeightMapProcessed = null;
        activeHeightMapSmoothed = null;
        updateDepthStudioPreview();
        buildDepthPreviewTexture();
        setStatus("Texture applied, but height map extraction failed.");
      };
      image.src = url;
    },
    undefined,
    () => {
      setStatus("Failed to load texture.");
    }
  );
};

const setBusy = (busy: boolean) => {
  document.body.classList.toggle("busy", busy);
  if (!buttonLabels.has(ui.generate)) buttonLabels.set(ui.generate, ui.generate.textContent ?? "");
  ui.generate.disabled = busy;
  ui.generate.textContent = busy ? "Generating..." : buttonLabels.get(ui.generate) ?? "Generate";
};

window.addEventListener("error", (event) => {
  const message = event.error instanceof Error ? event.error.message : event.message;
  setStatus(`Error: ${message}`);
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
  setStatus(`Error: ${reason}`);
});

const readConfig = (): Config & {
  branchDensity: number;
  thickness: number;
  branchStyle: BranchStyle;
  branchComplexity: number;
  branchVariation: number;
  branchProjection: BranchProjection;
} => ({
  sizeX: 26,
  sizeY: 22,
  sizeZ: 26,
  cellSize: 1,
  seed: Math.floor(Math.random() * 1_000_000) + 1,
  maxRetries: defaultConfig.maxRetries,
  boundaryAir: true,
  settleGravity: true,
  outputName: defaultConfig.outputName,
  branchDensity: Number(ui.branchDensity.value) / 100,
  thickness: Number(ui.thickness.value) / 100,
  branchStyle: (ui.branchStyle.value as BranchStyle) || "balanced",
  branchComplexity: Number(ui.branchComplexity.value) / 100,
  branchVariation: Number(ui.branchVariation.value) / 100,
  branchProjection: (ui.branchProjection.value as BranchProjection) || "triplanar",
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
  thicknessStart: number;
  thicknessEnd: number;
  jitter: number;
  seed: number;
  start: [number, number, number];
};

type BranchingConfig = Config & {
  branchDensity: number;
  thickness: number;
  branchStyle: BranchStyle;
  branchComplexity: number;
  branchVariation: number;
  branchProjection: BranchProjection;
};

const indexOf = (x: number, y: number, z: number, sizeX: number, sizeY: number) => x + y * sizeX + z * sizeX * sizeY;

const inBounds = (x: number, y: number, z: number, sizeX: number, sizeY: number, sizeZ: number) =>
  x >= 0 && y >= 0 && z >= 0 && x < sizeX && y < sizeY && z < sizeZ;

const randInt = (rng: () => number, min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const hasAnySolid = (grid: Uint8Array) => {
  for (let i = 0; i < grid.length; i += 1) {
    if (grid[i] !== 0) return true;
  }
  return false;
};

const offsetRange = (thickness: number) => {
  const min = -Math.floor((thickness - 1) / 2);
  const max = Math.ceil((thickness - 1) / 2);
  return { min, max };
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const fillSegment = (grid: Uint8Array, segment: Segment, sizeX: number, sizeY: number, sizeZ: number) => {
  const { axis, dir, length, thicknessStart, thicknessEnd, jitter, start, seed } = segment;
  const [sx, sy, sz] = start;
  const localRng = seededRandom(seed);

  for (let i = 0; i < length; i += 1) {
    const t = length <= 1 ? 0 : i / (length - 1);
    const baseThickness = lerp(thicknessStart, thicknessEnd, t);
    const noisyThickness = Math.max(1, Math.round(baseThickness + (localRng() - 0.5) * jitter));
    const { min, max } = offsetRange(noisyThickness);
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

const addNode = (grid: Uint8Array, cx: number, cy: number, cz: number, radius: number, sizeX: number, sizeY: number, sizeZ: number) => {
  for (let z = -radius; z <= radius; z += 1) {
    for (let y = -radius; y <= radius; y += 1) {
      for (let x = -radius; x <= radius; x += 1) {
        const nx = cx + x;
        const ny = cy + y;
        const nz = cz + z;
        if (!inBounds(nx, ny, nz, sizeX, sizeY, sizeZ)) continue;
        grid[indexOf(nx, ny, nz, sizeX, sizeY)] = 1;
      }
    }
  }
};

const extrudeTip = (grid: Uint8Array, axis: Axis, dir: 1 | -1, start: [number, number, number], length: number, thickness: number, sizeX: number, sizeY: number, sizeZ: number, seed: number) => {
  const seg: Segment = {
    axis,
    dir,
    length,
    thicknessStart: thickness,
    thicknessEnd: Math.max(1, Math.round(thickness * 0.55)),
    jitter: Math.max(1, Math.round(thickness * 0.25)),
    seed,
    start,
  };
  fillSegment(grid, seg, sizeX, sizeY, sizeZ);
};

const generateBranching = (config: BranchingConfig) => {
  const rng = seededRandom(config.seed || 1);
  const sizeX = config.sizeX;
  const sizeY = config.sizeY;
  const sizeZ = config.sizeZ;
  const grid = new Uint8Array(sizeX * sizeY * sizeZ);

  const centerX = Math.floor(sizeX / 2);
  const centerZ = Math.floor(sizeZ / 2);
  const density = clamp01(config.branchDensity);
  const complexity = clamp01(config.branchComplexity);
  const variation = clamp01(config.branchVariation);
  const style = config.branchStyle;
  const varianceStrength = 0.35 + variation * 0.85;
  const thicknessScale = 0.45 + config.thickness * 1.9;
  const baseThickness = Math.max(1, Math.min(9, Math.floor((Math.min(sizeX, sizeZ) / 6) * thicknessScale)));
  const margin = config.boundaryAir ? 1 : 0;
  const trunkLen = Math.max(3, Math.floor((sizeY - margin * 2) * (0.8 + complexity * 0.3)));
  const startY = margin;

  const makeSegment = (axis: Axis, dir: 1 | -1, length: number, tStart: number, tEnd: number, start: [number, number, number]) => ({
    axis,
    dir,
    length,
    thicknessStart: tStart,
    thicknessEnd: tEnd,
    jitter: Math.max(1, Math.round(tStart * (0.3 + varianceStrength * 0.35))),
    seed: randInt(rng, 1, 1_000_000),
    start,
  });

  const trunkStart = Math.max(1, Math.round(baseThickness * (0.7 + rng() * (0.35 + varianceStrength * 0.35))));
  const trunkEnd = Math.max(1, Math.round(baseThickness * (0.2 + rng() * (0.25 + varianceStrength * 0.25))));

  const segments: Segment[] = [makeSegment("y", 1, trunkLen, trunkStart, trunkEnd, [centerX, startY, centerZ])];

  if (density < 0.05) {
    grid[indexOf(centerX, Math.floor(sizeY / 2), centerZ, sizeX, sizeY)] = 1;
    return grid;
  }

  const pivotY = Math.min(sizeY - 1 - margin, startY + Math.floor(trunkLen * (0.45 + complexity * 0.25)));
  const tLen = Math.max(4, Math.floor(Math.min(sizeX, sizeZ) * (0.3 + complexity * 0.2)));
  const mainArmLen = Math.max(4, Math.floor(tLen * (0.7 + rng() * (0.4 + varianceStrength * 0.5))));

  const addBalancedArms = (y: number, lengthScale: number) => {
    const armLen = Math.max(3, Math.floor(mainArmLen * lengthScale));
    if (density > 0.08) {
      segments.push(makeSegment("x", 1, armLen, trunkEnd, Math.max(1, Math.round(trunkEnd * 0.7)), [centerX, y, centerZ]));
    }
    if (density > 0.12) {
      segments.push(makeSegment("x", -1, armLen, trunkEnd, Math.max(1, Math.round(trunkEnd * 0.7)), [centerX, y, centerZ]));
    }
    if (density > 0.2) {
      const zLen = Math.max(3, Math.floor(armLen * (0.6 + rng() * 0.5)));
      segments.push(makeSegment("z", rng() > 0.5 ? 1 : -1, zLen, Math.max(2, trunkEnd - 1), Math.max(1, Math.round(trunkEnd * 0.6)), [centerX, y, centerZ]));
    }
  };

  if (style === "cantilever") {
    const dir = rng() > 0.5 ? 1 : -1;
    const longLen = Math.max(4, Math.floor(mainArmLen * (1.2 + complexity * 0.6)));
    segments.push(makeSegment("x", dir, longLen, trunkEnd, Math.max(1, Math.round(trunkEnd * 0.55)), [centerX, pivotY, centerZ]));
    if (density > 0.3) {
      const counterLen = Math.max(3, Math.floor(mainArmLen * (0.45 + rng() * 0.3)));
      segments.push(makeSegment("x", (dir * -1) as 1 | -1, counterLen, trunkEnd, Math.max(1, Math.round(trunkEnd * 0.6)), [centerX, pivotY, centerZ]));
    }
  } else {
    addBalancedArms(pivotY, 1);
  }

  if (style === "crown") {
    const crownY = Math.min(sizeY - 2 - margin, startY + Math.floor(trunkLen * 0.85));
    const crownLevels = 1 + Math.round(complexity * 2);
    for (let i = 0; i < crownLevels; i += 1) {
      const levelY = Math.min(sizeY - 2 - margin, crownY - i * 2);
      addBalancedArms(levelY, 0.75 + rng() * 0.35);
    }
  }

  if (style === "stacked" && density > 0.15) {
    const stackLevels = 2 + Math.round(complexity * 3);
    for (let i = 0; i < stackLevels; i += 1) {
      const t = stackLevels === 1 ? 0.5 : i / (stackLevels - 1);
      const levelY = Math.min(sizeY - 2 - margin, startY + Math.floor(trunkLen * (0.2 + t * 0.6)));
      addBalancedArms(levelY, 0.55 + t * 0.55);
    }
  }

  const extraBranchFactor = config.settleGravity ? 1 : 0;
  const maxSegments = Math.min(
    240,
    Math.max(1, Math.round(6 + density * density * 120 + complexity * 130) + extraBranchFactor * 6)
  );

  for (let i = 0; i < segments.length && segments.length < maxSegments; i += 1) {
    const seg = segments[i];
    if (seg.length < 6) continue;
    const branchCount =
      seg.axis === "y"
        ? randInt(rng, 1, 2 + Math.round(density * 4 + complexity * 3) + extraBranchFactor)
        : randInt(rng, 0, 1 + Math.round(density * 3 + complexity * 2) + extraBranchFactor);
    for (let b = 0; b < branchCount && segments.length < maxSegments; b += 1) {
      const pivotOffset = randInt(rng, 1, Math.max(2, seg.length - 2));
      const px = seg.axis === "x" ? seg.start[0] + seg.dir * pivotOffset : seg.start[0];
      const py = seg.axis === "y" ? seg.start[1] + seg.dir * pivotOffset : seg.start[1];
      const pz = seg.axis === "z" ? seg.start[2] + seg.dir * pivotOffset : seg.start[2];

      const axes: Axis[] = seg.axis === "x" ? ["y", "z"] : seg.axis === "y" ? ["x", "z"] : ["x", "y"];
      const axis = axes[randInt(rng, 0, axes.length - 1)];
      const dir = (() => {
        if (axis === "x") return px < centerX ? 1 : -1;
        if (axis === "z") return pz < centerZ ? 1 : -1;
        return rng() > 0.55 ? 1 : -1;
      })();
      const inwardOutwardFlip = rng() > 0.5 ? 1 : -1;
      const finalDir = (dir * inwardOutwardFlip) as 1 | -1;
      const length = Math.max(2, Math.floor(seg.length * (0.2 + rng() * (0.55 + complexity * 0.25))));
      const thinBias = rng() * (1 - density * 0.4) + variation * 0.35;
      const tStart = Math.max(
        1,
        Math.round(seg.thicknessStart * (0.2 + rng() * (0.5 + variation * 0.4)) * (0.65 + thinBias))
      );
      const tEnd = Math.max(1, Math.round(tStart * (0.25 + rng() * (0.45 + variation * 0.35))));

      segments.push(makeSegment(axis, finalDir, length, tStart, tEnd, [px, py, pz]));

      if (rng() > 0.35 - complexity * 0.1 && segments.length < maxSegments) {
        const stubAxis = axes[randInt(rng, 0, axes.length - 1)];
        const stubDir = rng() > 0.5 ? 1 : -1;
        const stubLen = randInt(rng, 2, 4);
        const stubStart = Math.max(1, Math.round(tStart * 0.55));
        segments.push(makeSegment(stubAxis, stubDir, stubLen, stubStart, Math.max(1, Math.round(stubStart * 0.5)), [px, py, pz]));
      }

      if (rng() > 0.45 - complexity * 0.15 && segments.length < maxSegments) {
        const antennaAxis = axes[randInt(rng, 0, axes.length - 1)];
        const antennaDir = rng() > 0.5 ? 1 : -1;
        const antennaLen = randInt(rng, 4, 12);
        const antennaStart = Math.max(1, Math.round(tStart * 0.3));
        segments.push(makeSegment(antennaAxis, antennaDir, antennaLen, antennaStart, Math.max(1, Math.round(antennaStart * 0.35)), [px, py, pz]));
      }
    }
  }

  for (const segment of segments) {
    fillSegment(grid, segment, sizeX, sizeY, sizeZ);
    const tipOffset = segment.length - 1;
    const tipX = segment.axis === "x" ? segment.start[0] + segment.dir * tipOffset : segment.start[0];
    const tipY = segment.axis === "y" ? segment.start[1] + segment.dir * tipOffset : segment.start[1];
    const tipZ = segment.axis === "z" ? segment.start[2] + segment.dir * tipOffset : segment.start[2];
    if (rng() > 0.55) addNode(grid, tipX, tipY, tipZ, Math.max(1, Math.round(segment.thicknessEnd / 2)), sizeX, sizeY, sizeZ);
    if (segment.thicknessEnd <= 2 && rng() > 0.4) {
      const tipAxis = segment.axis;
      const tipDir = segment.dir;
      const tipStart: [number, number, number] = [tipX, tipY, tipZ];
      extrudeTip(grid, tipAxis, tipDir, tipStart, randInt(rng, 2, 6), Math.max(1, segment.thicknessEnd), sizeX, sizeY, sizeZ, randInt(rng, 1, 1_000_000));
    }
  }

  return grid;
};

const generateWfcTiles = (config: Config) => {
  const grid = runWfc(config, tiles);
  let tilesOut = collapseToTiles(grid, tiles);
  tilesOut = applyGravity(tilesOut, config, tiles);
  return tilesOut;
};

const dilate = (grid: Uint8Array, sizeX: number, sizeY: number, sizeZ: number, iterations = 1) => {
  let current = grid;
  for (let iter = 0; iter < iterations; iter += 1) {
    const next = new Uint8Array(current);
    for (let z = 0; z < sizeZ; z += 1) {
      for (let y = 0; y < sizeY; y += 1) {
        for (let x = 0; x < sizeX; x += 1) {
          const idx = indexOf(x, y, z, sizeX, sizeY);
          if (current[idx] === 1) continue;
          let hasSolidNeighbor = false;
          forEachNeighbor(x, y, z, sizeX, sizeY, sizeZ, (nx, ny, nz) => {
            if (current[indexOf(nx, ny, nz, sizeX, sizeY)] === 1) hasSolidNeighbor = true;
          });
          if (hasSolidNeighbor) next[idx] = 1;
        }
      }
    }
    current = next;
  }
  grid.set(current);
};

const forEachNeighbor = (x: number, y: number, z: number, sizeX: number, sizeY: number, sizeZ: number, fn: (nx: number, ny: number, nz: number) => void) => {
  const dirs = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ] as const;
  for (const [dx, dy, dz] of dirs) {
    const nx = x + dx;
    const ny = y + dy;
    const nz = z + dz;
    if (inBounds(nx, ny, nz, sizeX, sizeY, sizeZ)) fn(nx, ny, nz);
  }
};

const fillEnclosedAir = (grid: Uint8Array, sizeX: number, sizeY: number, sizeZ: number) => {
  const visited = new Uint8Array(grid.length);
  const queue: number[] = [];

  const pushIfAir = (x: number, y: number, z: number) => {
    const idx = indexOf(x, y, z, sizeX, sizeY);
    if (grid[idx] === 0 && visited[idx] === 0) {
      visited[idx] = 1;
      queue.push(idx);
    }
  };

  for (let x = 0; x < sizeX; x += 1) {
    for (let y = 0; y < sizeY; y += 1) {
      pushIfAir(x, y, 0);
      pushIfAir(x, y, sizeZ - 1);
    }
  }
  for (let z = 0; z < sizeZ; z += 1) {
    for (let x = 0; x < sizeX; x += 1) {
      pushIfAir(x, 0, z);
      pushIfAir(x, sizeY - 1, z);
    }
  }
  for (let z = 0; z < sizeZ; z += 1) {
    for (let y = 0; y < sizeY; y += 1) {
      pushIfAir(0, y, z);
      pushIfAir(sizeX - 1, y, z);
    }
  }

  while (queue.length) {
    const idx = queue.shift()!;
    const z = Math.floor(idx / (sizeX * sizeY));
    const rem = idx - z * sizeX * sizeY;
    const y = Math.floor(rem / sizeX);
    const x = rem - y * sizeX;
    forEachNeighbor(x, y, z, sizeX, sizeY, sizeZ, (nx, ny, nz) => {
      const nIdx = indexOf(nx, ny, nz, sizeX, sizeY);
      if (grid[nIdx] === 0 && visited[nIdx] === 0) {
        visited[nIdx] = 1;
        queue.push(nIdx);
      }
    });
  }

  for (let i = 0; i < grid.length; i += 1) {
    if (grid[i] === 0 && visited[i] === 0) grid[i] = 1;
  }
};

const fillThinGaps = (grid: Uint8Array, sizeX: number, sizeY: number, sizeZ: number, iterations = 2) => {
  let current = grid;
  for (let iter = 0; iter < iterations; iter += 1) {
    const next = new Uint8Array(current);
    for (let z = 0; z < sizeZ; z += 1) {
      for (let y = 0; y < sizeY; y += 1) {
        for (let x = 0; x < sizeX; x += 1) {
          const idx = indexOf(x, y, z, sizeX, sizeY);
          if (current[idx] === 1) continue;
          let neighbors = 0;
          forEachNeighbor(x, y, z, sizeX, sizeY, sizeZ, (nx, ny, nz) => {
            if (current[indexOf(nx, ny, nz, sizeX, sizeY)] === 1) neighbors += 1;
          });
          if (neighbors >= 4) next[idx] = 1;
        }
      }
    }
    current = next;
  }
  grid.set(current);
};

const keepLargestComponent = (grid: Uint8Array, sizeX: number, sizeY: number, sizeZ: number) => {
  const visited = new Uint8Array(grid.length);
  let largest: number[] = [];

  for (let i = 0; i < grid.length; i += 1) {
    if (grid[i] === 0 || visited[i]) continue;
    const component: number[] = [];
    const queue = [i];
    visited[i] = 1;
    while (queue.length) {
      const idx = queue.shift()!;
      component.push(idx);
      const z = Math.floor(idx / (sizeX * sizeY));
      const rem = idx - z * sizeX * sizeY;
      const y = Math.floor(rem / sizeX);
      const x = rem - y * sizeX;
      forEachNeighbor(x, y, z, sizeX, sizeY, sizeZ, (nx, ny, nz) => {
        const nIdx = indexOf(nx, ny, nz, sizeX, sizeY);
        if (grid[nIdx] === 1 && visited[nIdx] === 0) {
          visited[nIdx] = 1;
          queue.push(nIdx);
        }
      });
    }
    if (component.length > largest.length) largest = component;
  }

  const keep = new Uint8Array(grid.length);
  for (const idx of largest) keep[idx] = 1;
  for (let i = 0; i < grid.length; i += 1) grid[i] = keep[i];
};

type SolidBounds = {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
};

const getSolidBounds = (grid: Uint8Array, sizeX: number, sizeY: number, sizeZ: number): SolidBounds | null => {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let z = 0; z < sizeZ; z += 1) {
    for (let y = 0; y < sizeY; y += 1) {
      for (let x = 0; x < sizeX; x += 1) {
        if (grid[indexOf(x, y, z, sizeX, sizeY)] === 0) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        minZ = Math.min(minZ, z);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        maxZ = Math.max(maxZ, z);
      }
    }
  }
  if (!Number.isFinite(minX)) return null;
  return { minX, minY, minZ, maxX, maxY, maxZ };
};

const carveDirs = [
  { dx: 1, dy: 0, dz: 0, axis: "x" as const, sign: 1 as const },
  { dx: -1, dy: 0, dz: 0, axis: "x" as const, sign: -1 as const },
  { dx: 0, dy: 1, dz: 0, axis: "y" as const, sign: 1 as const },
  { dx: 0, dy: -1, dz: 0, axis: "y" as const, sign: -1 as const },
  { dx: 0, dy: 0, dz: 1, axis: "z" as const, sign: 1 as const },
  { dx: 0, dy: 0, dz: -1, axis: "z" as const, sign: -1 as const },
];

const faceUvForVoxel = (
  x: number,
  y: number,
  z: number,
  axis: "x" | "y" | "z",
  bounds: SolidBounds
) => {
  const spanX = Math.max(1, bounds.maxX - bounds.minX + 1);
  const spanY = Math.max(1, bounds.maxY - bounds.minY + 1);
  const spanZ = Math.max(1, bounds.maxZ - bounds.minZ + 1);
  if (axis === "x") {
    return {
      u: (z - bounds.minZ) / spanZ,
      v: (y - bounds.minY) / spanY,
    };
  }
  if (axis === "y") {
    return {
      u: (x - bounds.minX) / spanX,
      v: (z - bounds.minZ) / spanZ,
    };
  }
  return {
    u: (x - bounds.minX) / spanX,
    v: (y - bounds.minY) / spanY,
  };
};

const slopeClampFactor = 0.22;

const getDetailSubdivisions = (faceCount: number) => {
  if (faceCount > 2600) return 6;
  if (faceCount > 1200) return 8;
  return 12;
};

const lerpVec = (a: number[], b: number[], t: number) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

const computeUvBounds = (faces: Face[]) => {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (const face of faces) {
    for (const v of face.vertices) {
      minX = Math.min(minX, v[0]);
      minY = Math.min(minY, v[1]);
      minZ = Math.min(minZ, v[2]);
      maxX = Math.max(maxX, v[0]);
      maxY = Math.max(maxY, v[1]);
      maxZ = Math.max(maxZ, v[2]);
    }
  }

  return {
    minX,
    minY,
    minZ,
    spanX: Math.max(1e-6, maxX - minX),
    spanY: Math.max(1e-6, maxY - minY),
    spanZ: Math.max(1e-6, maxZ - minZ),
  };
};

const uvFromNormal = (
  n: [number, number, number],
  v: number[],
  bounds: { minX: number; minY: number; minZ: number; spanX: number; spanY: number; spanZ: number }
) => {
  const [x, y, z] = v;
  if (Math.abs(n[0]) === 1) {
    return [(z - bounds.minZ) / bounds.spanZ, (y - bounds.minY) / bounds.spanY];
  }
  if (Math.abs(n[1]) === 1) {
    return [(x - bounds.minX) / bounds.spanX, (z - bounds.minZ) / bounds.spanZ];
  }
  return [(x - bounds.minX) / bounds.spanX, (y - bounds.minY) / bounds.spanY];
};

const sampleTriPlanarTone = (
  map: HeightMap,
  p: number[],
  normal: number[],
  bounds: { minX: number; minY: number; minZ: number; spanX: number; spanY: number; spanZ: number }
) => {
  const wx = Math.abs(normal[0]);
  const wy = Math.abs(normal[1]);
  const wz = Math.abs(normal[2]);
  const sum = wx + wy + wz + 1e-6;
  const sx = sampleHeightMap(map, (p[2] - bounds.minZ) / bounds.spanZ, (p[1] - bounds.minY) / bounds.spanY);
  const sy = sampleHeightMap(map, (p[0] - bounds.minX) / bounds.spanX, (p[2] - bounds.minZ) / bounds.spanZ);
  const sz = sampleHeightMap(map, (p[0] - bounds.minX) / bounds.spanX, (p[1] - bounds.minY) / bounds.spanY);
  return clamp01((sx * wx + sy * wy + sz * wz) / sum);
};

const sampleDominantAxisTone = (
  map: HeightMap,
  p: number[],
  normal: number[],
  bounds: { minX: number; minY: number; minZ: number; spanX: number; spanY: number; spanZ: number }
) => {
  const ax = Math.abs(normal[0]);
  const ay = Math.abs(normal[1]);
  const az = Math.abs(normal[2]);
  if (ax >= ay && ax >= az) {
    return sampleHeightMap(map, (p[2] - bounds.minZ) / bounds.spanZ, (p[1] - bounds.minY) / bounds.spanY);
  }
  if (ay >= az) {
    return sampleHeightMap(map, (p[0] - bounds.minX) / bounds.spanX, (p[2] - bounds.minZ) / bounds.spanZ);
  }
  return sampleHeightMap(map, (p[0] - bounds.minX) / bounds.spanX, (p[1] - bounds.minY) / bounds.spanY);
};

const samplePlanarTone = (
  map: HeightMap,
  p: number[],
  bounds: { minX: number; minY: number; minZ: number; spanX: number; spanY: number; spanZ: number }
) => sampleHeightMap(map, (p[0] - bounds.minX) / bounds.spanX, (p[2] - bounds.minZ) / bounds.spanZ);

const sampleCylindricalTone = (
  map: HeightMap,
  p: number[],
  bounds: { minX: number; minY: number; minZ: number; spanX: number; spanY: number; spanZ: number }
) => {
  const centerX = bounds.minX + bounds.spanX * 0.5;
  const centerZ = bounds.minZ + bounds.spanZ * 0.5;
  const angle = Math.atan2(p[2] - centerZ, p[0] - centerX);
  const u = (angle + Math.PI) / (Math.PI * 2);
  const v = (p[1] - bounds.minY) / bounds.spanY;
  return sampleHeightMap(map, u, v);
};

const sampleDetailTone = (
  map: HeightMap,
  p: number[],
  normal: number[],
  bounds: { minX: number; minY: number; minZ: number; spanX: number; spanY: number; spanZ: number },
  projection: BranchProjection
) => {
  switch (projection) {
    case "dominant":
      return sampleDominantAxisTone(map, p, normal, bounds);
    case "planar":
      return samplePlanarTone(map, p, bounds);
    case "cylindrical":
      return sampleCylindricalTone(map, p, bounds);
    default:
      return sampleTriPlanarTone(map, p, normal, bounds);
  }
};

const clampDisplacementSlopes = (displacements: Float32Array, basePositions: number[][], indices: number[], sign: number, maxDepth: number) => {
  const neighbors = Array.from({ length: basePositions.length }, () => new Set<number>());
  const addEdge = (a: number, b: number) => {
    neighbors[a].add(b);
    neighbors[b].add(a);
  };
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];
    addEdge(a, b);
    addEdge(b, c);
    addEdge(c, a);
  }

  for (let iter = 0; iter < 3; iter += 1) {
    for (let i = 0; i < neighbors.length; i += 1) {
      for (const j of neighbors[i]) {
        if (j <= i) continue;
        const a = basePositions[i];
        const b = basePositions[j];
        const edgeLen = Math.max(1e-6, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
        const maxDelta = edgeLen * slopeClampFactor;
        const delta = displacements[i] - displacements[j];
        if (Math.abs(delta) <= maxDelta) continue;
        const mid = (displacements[i] + displacements[j]) * 0.5;
        const half = (maxDelta * Math.sign(delta)) * 0.5;
        displacements[i] = mid + half;
        displacements[j] = mid - half;
      }
    }

    for (let i = 0; i < displacements.length; i += 1) {
      displacements[i] = sign > 0 ? clamp01(displacements[i] / maxDepth) * maxDepth : -clamp01(-displacements[i] / maxDepth) * maxDepth;
    }
  }
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

const buildTexturedGeometry = (faces: Face[]) => {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const bounds = computeUvBounds(faces);
  const pushUv = (n: [number, number, number], v: number[]) => {
    const [u, vCoord] = uvFromNormal(n, v, bounds);
    uvs.push(u, vCoord);
  };

  for (const face of faces) {
    const [a, b, c, d] = face.vertices;
    const n = face.normal;
    positions.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let i = 0; i < 6; i += 1) normals.push(...n);
    pushUv(n, a);
    pushUv(n, b);
    pushUv(n, c);
    pushUv(n, a);
    pushUv(n, c);
    pushUv(n, d);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeBoundingSphere();
  return geometry;
};

const buildDetailedGeometry = (faces: Face[]) => {
  if (faces.length === 0) return new THREE.BufferGeometry();
  const detailMap = getActiveDetailMap();
  if (!detailMap || getCarveSettings().maxDepth <= 0) {
    return buildTexturedGeometry(faces);
  }

  const basePositions: number[][] = [];
  const uvs: number[] = [];
  const normalSums: number[][] = [];
  const normalCounts: number[] = [];
  const indices: number[] = [];
  const { maxDepth } = getCarveSettings();
  const depthUnits = Math.max(0, maxDepth / Math.max(1e-6, modelScale));
  const mode = getDetailMode();
  const sign = mode === "emboss" ? 1 : -1;
  const bounds = computeUvBounds(faces);
  const projection = getBranchProjection();
  const segments = getDetailSubdivisions(faces.length);
  const vertexLookup = new Map<string, number>();
  const getVertexKey = (p: number[]) => `${Math.round(p[0] * 100000)},${Math.round(p[1] * 100000)},${Math.round(p[2] * 100000)}`;
  const pushVertex = (p: number[], uv: number[], n: [number, number, number]) => {
    const key = getVertexKey(p);
    const existing = vertexLookup.get(key);
    if (existing !== undefined) {
      normalSums[existing][0] += n[0];
      normalSums[existing][1] += n[1];
      normalSums[existing][2] += n[2];
      normalCounts[existing] += 1;
      return existing;
    }
    const index = basePositions.length;
    vertexLookup.set(key, index);
    basePositions.push([p[0], p[1], p[2]]);
    normalSums.push([n[0], n[1], n[2]]);
    normalCounts.push(1);
    uvs.push(uv[0], uv[1]);
    return index;
  };

  for (const face of faces) {
    const [a, b, c, d] = face.vertices;
    const n = face.normal;
    const localIdx: number[] = [];

    for (let j = 0; j <= segments; j += 1) {
      const v = j / segments;
      for (let i = 0; i <= segments; i += 1) {
        const u = i / segments;
        const ab = lerpVec(a, b, u);
        const dc = lerpVec(d, c, u);
        const p = lerpVec(ab, dc, v);
        const [uvU, uvV] = uvFromNormal(n, p, bounds);
        localIdx.push(pushVertex(p, [uvU, uvV], n));
      }
    }

    const stride = segments + 1;
    for (let j = 0; j < segments; j += 1) {
      for (let i = 0; i < segments; i += 1) {
        const i0 = i + j * stride;
        const i1 = i + 1 + j * stride;
        const i2 = i + 1 + (j + 1) * stride;
        const i3 = i + (j + 1) * stride;
        indices.push(localIdx[i0], localIdx[i1], localIdx[i2], localIdx[i0], localIdx[i2], localIdx[i3]);
      }
    }
  }

  const smoothNormals = normalSums.map((n) => {
    const len = Math.max(1e-6, Math.hypot(n[0], n[1], n[2]));
    return [n[0] / len, n[1] / len, n[2] / len];
  });
  const displacements = new Float32Array(basePositions.length);
  for (let i = 0; i < basePositions.length; i += 1) {
    const tone = sampleDetailTone(detailMap, basePositions[i], smoothNormals[i], bounds, projection);
    const depthValue = mode === "emboss" ? tone : 1 - tone;
    const sculptMode = getModelMode();
    const branchLike = sculptMode === "branching" || sculptMode === "wfc";
    const depthGamma = branchLike ? 1.5 : 2.2;
    const tonedDepth = Math.pow(clamp01(depthValue), depthGamma);
    const coverage = Math.min(1, normalCounts[i] / 3);
    const edgeFloor = branchLike ? 0.4 : 0.2;
    const edgeFactor = edgeFloor + (1 - edgeFloor) * coverage;
    displacements[i] = tonedDepth * depthUnits * sign * edgeFactor;
  }

  clampDisplacementSlopes(displacements, basePositions, indices, sign, depthUnits);

  const positions = new Float32Array(basePositions.length * 3);
  for (let i = 0; i < basePositions.length; i += 1) {
    const p = basePositions[i];
    const n = smoothNormals[i];
    const d = displacements[i];
    positions[i * 3] = p[0] + n[0] * d;
    positions[i * 3 + 1] = p[1] + n[1] * d;
    positions[i * 3 + 2] = p[2] + n[2] * d;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

const buildEtchedCubeGeometry = (map: HeightMap | null) => {
  const { cubeSizeMm, marginMm, resolution, depthGain, allFaces, wrapMode, rotation, flipX, flipY } = getEtchSettings();
  const { maxDepth } = getCarveSettings();
  const mode = getDetailMode();
  const sign = mode === "emboss" ? 1 : -1;
  const half = cubeSizeMm * 0.5;
  const seg = Math.max(16, Math.min(512, Math.round(resolution)));
  const step = cubeSizeMm / seg;
  const softMargin = Math.max(0.25, Math.min(2.5, marginMm * 0.25));

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const addFace = (origin: THREE.Vector3, uDir: THREE.Vector3, vDir: THREE.Vector3, normal: THREE.Vector3, faceId: number) => {
    const baseIndex = positions.length / 3;
    const indexAt = (x: number, y: number) => baseIndex + x + y * (seg + 1);
    for (let iy = 0; iy <= seg; iy += 1) {
      const v = iy / seg;
      for (let ix = 0; ix <= seg; ix += 1) {
        const u = ix / seg;
        const px = -half + u * cubeSizeMm;
        const py = half - v * cubeSizeMm;
        const pos = new THREE.Vector3()
          .addScaledVector(uDir, px)
          .addScaledVector(vDir, py)
          .add(origin);
        const useWrap = wrapMode === "sides" && Math.abs(normal.y) < 0.5;
        const [uvU, uvV] = useWrap
          ? sampleWrappedUv(pos, cubeSizeMm, rotation, flipX, flipY)
          : transformUv(u, v, rotation, flipX, flipY);

        let depth = 0;
        if (map && maxDepth > 0) {
          const edgeDist = Math.min(px + half, half - px, py + half, half - py);
          if (edgeDist > marginMm) {
            const fade = clamp01((edgeDist - marginMm) / softMargin);
            const tone = sampleHeightMap(map, uvU, uvV);
            const depthValue = mode === "emboss" ? tone : 1 - tone;
            const posterized = Number(ui.depthPosterize.value) > 0;
            const hardPower = posterized ? 1.0 : 1.25;
            depth = Math.pow(clamp01(depthValue), hardPower) * maxDepth * depthGain * fade;
          }
        }
        const displaced = pos.clone().addScaledVector(normal, depth * sign);
        positions.push(displaced.x, displaced.y, displaced.z);
        uvs.push(uvU, uvV);
      }
    }

    for (let iy = 0; iy < seg; iy += 1) {
      for (let ix = 0; ix < seg; ix += 1) {
        const i0 = indexAt(ix, iy);
        const i1 = indexAt(ix + 1, iy);
        const i2 = indexAt(ix + 1, iy + 1);
        const i3 = indexAt(ix, iy + 1);
        indices.push(i0, i2, i1, i0, i3, i2);
      }
    }
  };

  const faces = [
    { origin: new THREE.Vector3(0, 0, half), uDir: new THREE.Vector3(1, 0, 0), vDir: new THREE.Vector3(0, -1, 0), normal: new THREE.Vector3(0, 0, 1), id: 0 },
    { origin: new THREE.Vector3(0, 0, -half), uDir: new THREE.Vector3(-1, 0, 0), vDir: new THREE.Vector3(0, -1, 0), normal: new THREE.Vector3(0, 0, -1), id: 1 },
    { origin: new THREE.Vector3(half, 0, 0), uDir: new THREE.Vector3(0, 0, -1), vDir: new THREE.Vector3(0, -1, 0), normal: new THREE.Vector3(1, 0, 0), id: 2 },
    { origin: new THREE.Vector3(-half, 0, 0), uDir: new THREE.Vector3(0, 0, 1), vDir: new THREE.Vector3(0, -1, 0), normal: new THREE.Vector3(-1, 0, 0), id: 3 },
    { origin: new THREE.Vector3(0, half, 0), uDir: new THREE.Vector3(1, 0, 0), vDir: new THREE.Vector3(0, 0, 1), normal: new THREE.Vector3(0, 1, 0), id: 4 },
    { origin: new THREE.Vector3(0, -half, 0), uDir: new THREE.Vector3(1, 0, 0), vDir: new THREE.Vector3(0, 0, -1), normal: new THREE.Vector3(0, -1, 0), id: 5 },
  ];

  if (allFaces) {
    for (const face of faces) addFace(face.origin, face.uDir, face.vDir, face.normal, face.id);
  } else {
    const face = faces[0];
    addFace(face.origin, face.uDir, face.vDir, face.normal, face.id);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

const showGeometry = (geometry: THREE.BufferGeometry) => {
  group.clear();
  currentGeometry = geometry;
  const mesh = new THREE.Mesh(geometry, sharedMaterial);
  group.add(mesh);
  updateMaterialPreview();

  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  const fallbackDistance = maxDim * 1.6 + 10;
  const fallbackNear = Math.max(0.1, fallbackDistance / 100);
  const fallbackFar = fallbackDistance * 10;
  const fogNear = Math.max(20, fallbackDistance * 0.55);
  const fogFar = Math.max(fogNear + 60, fallbackDistance * 4.2);
  if (scene.fog) {
    scene.fog.near = fogNear;
    scene.fog.far = fogFar;
  }

  const isPointVisible = (point: THREE.Vector3) => {
    camera.updateMatrixWorld();
    const viewProj = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const frustum = new THREE.Frustum().setFromProjectionMatrix(viewProj);
    return frustum.containsPoint(point);
  };

  if (userHasMovedCamera && lastCameraState) {
    suppressCameraEvents = true;
    camera.position.copy(lastCameraState.position);
    controls.target.copy(lastCameraState.target);
    camera.near = Math.min(camera.near, fallbackNear);
    camera.far = Math.max(camera.far, fallbackFar);
    camera.updateProjectionMatrix();
    controls.update();
    suppressCameraEvents = false;
    if (isPointVisible(center)) return;
  }

  camera.near = fallbackNear;
  camera.far = fallbackFar;
  camera.position.set(center.x + fallbackDistance, center.y + fallbackDistance * 0.6, center.z + fallbackDistance);
  camera.lookAt(center);
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.update();
  userHasMovedCamera = true;
  if (!lastCameraState) {
    lastCameraState = { position: new THREE.Vector3(), target: new THREE.Vector3() };
  }
  lastCameraState.position.copy(camera.position);
  lastCameraState.target.copy(controls.target);
};

const rebuildMesh = () => {
  currentFaces = buildFaces(currentTiles, currentConfig);
  const solidCount = currentTiles.filter((tile) => tile.solid).length;
  if (solidCount === 0) {
    setStatus(`No solid voxels. Try a new seed.`);
    return;
  }
  if (currentFaces.length === 0) {
    setStatus(`Generated voxels but found no surface faces.`);
    return;
  }
  const bounds = computeUvBounds(currentFaces);
  const maxDim = Math.max(bounds.spanX, bounds.spanY, bounds.spanZ);
  modelScale = maxDim > 0 ? targetSizeMM / maxDim : 1;
  const geometry = buildDetailedGeometry(currentFaces);
  geometry.scale(modelScale, modelScale, modelScale);
  geometry.center();
  showGeometry(geometry);
};

const applySurfaceDetail = () => {
  const mode = getModelMode();
  if (mode === "etch") {
    currentFaces = [];
    modelScale = 1;
    const geometry = buildEtchedCubeGeometry(getActiveDetailMap());
    showGeometry(geometry);
    const { cubeSizeMm } = getEtchSettings();
    const { maxDepth } = getCarveSettings();
    const label = getDetailMode() === "emboss" ? "Emboss" : "Carve";
    if (getActiveDetailMap() && maxDepth > 0) {
      setStatus(`Ready. Etch cube ${cubeSizeMm} mm. ${label} ${maxDepth.toFixed(1)} mm.`);
    } else {
      setStatus(`Ready. Etch cube ${cubeSizeMm} mm. Load an image to carve.`);
    }
    return;
  }

  if (mode === "branching") {
    if (!baseGrid) return;
    currentTiles = Array.from(baseGrid, (value) => (value ? solidTile : airTile));
  } else if (mode === "wfc") {
    if (currentTiles.length === 0) return;
  }
  rebuildMesh();
  const solidCount = currentTiles.filter((tile) => tile.solid).length;
  const { maxDepth } = getCarveSettings();
  if (getActiveDetailMap() && maxDepth > 0) {
    const label = getDetailMode() === "emboss" ? "Emboss" : "Carve";
    setStatus(`Ready. Solids ${solidCount}. ${label} ${maxDepth.toFixed(1)} mm. For crisp engraving, switch Mode to Etch Cube.`);
  } else {
    setStatus(`Ready. Solids ${solidCount}.`);
  }
};

const generate = () => {
  if (isGenerating) return;
  isGenerating = true;
  setBusy(true);
  setStatus("Generating...");
  // Let the UI paint the busy state before heavy work.
  setTimeout(() => {
    try {
      const mode = getModelMode();
      if (mode === "etch") {
        baseGrid = null;
        applySurfaceDetail();
        return;
      }
      const initialConfig = readConfig();
      if (mode === "wfc") {
        currentConfig = initialConfig;
        baseGrid = null;
        currentTiles = generateWfcTiles(initialConfig);
        applySurfaceDetail();
        return;
      }
      const attempts = Math.max(1, initialConfig.maxRetries);
      let chosenConfig: BranchingConfig | null = null;
      let chosenGrid: Uint8Array | null = null;

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const attemptConfig = {
          ...initialConfig,
          seed: Math.floor(Math.random() * 1_000_000) + 1,
        };
        const grid = generateBranching(attemptConfig);
        // Thicken to remove open faces/voids while keeping thin branches.
        dilate(grid, attemptConfig.sizeX, attemptConfig.sizeY, attemptConfig.sizeZ, 1);
        fillEnclosedAir(grid, attemptConfig.sizeX, attemptConfig.sizeY, attemptConfig.sizeZ);
        fillThinGaps(grid, attemptConfig.sizeX, attemptConfig.sizeY, attemptConfig.sizeZ, 2);
        keepLargestComponent(grid, attemptConfig.sizeX, attemptConfig.sizeY, attemptConfig.sizeZ);
        if (!hasAnySolid(grid)) continue;
        chosenConfig = attemptConfig;
        chosenGrid = grid;
        break;
      }

      if (!chosenConfig || !chosenGrid) {
        throw new Error(`Generator produced no solids after ${attempts} attempts.`);
      }

      currentConfig = chosenConfig;
      baseGrid = chosenGrid;
      applySurfaceDetail();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(error);
      setStatus(`Error: ${message}`);
    } finally {
      setBusy(false);
      isGenerating = false;
    }
  }, 20);
};

const render = () => {
  controls.update();
  renderer.render(scene, camera);
  depthRenderer.render(depthScene, depthCamera);
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

const geometryToStl = (geometry: THREE.BufferGeometry) => {
  const source = geometry.getIndex() ? geometry.toNonIndexed() : geometry;
  const positions = source.getAttribute("position");
  if (!positions) return "";
  const triangles: string[] = [];
  const getVec = (vertexIndex: number) => [
    positions.getX(vertexIndex),
    positions.getY(vertexIndex),
    positions.getZ(vertexIndex),
  ];
  const triangleCount = positions.count / 3;
  for (let tri = 0; tri < triangleCount; tri += 1) {
    const i0 = tri * 3;
    const i1 = tri * 3 + 1;
    const i2 = tri * 3 + 2;
    const a = getVec(i0);
    const b = getVec(i1);
    const c = getVec(i2);
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vy = c[1] - a[1];
    const vz = c[2] - a[2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const len = Math.max(1e-6, Math.hypot(nx, ny, nz));
    const n: [number, number, number] = [nx / len, ny / len, nz / len];
    triangles.push(
      `facet normal ${n[0]} ${n[1]} ${n[2]}\n` +
        `  outer loop\n` +
        `    vertex ${a[0]} ${a[1]} ${a[2]}\n` +
        `    vertex ${b[0]} ${b[1]} ${b[2]}\n` +
        `    vertex ${c[0]} ${c[1]} ${c[2]}\n` +
        `  endloop\n` +
        `endfacet`
    );
  }
  return `solid branching\n${triangles.join("\n")}\nendsolid branching\n`;
};

const exportStl = async () => {
  if (!currentGeometry && currentFaces.length === 0) {
    setStatus("Nothing to export. Generate first.");
    return;
  }
  const stl = currentGeometry ? geometryToStl(currentGeometry) : voxelToStl(currentFaces);
  if (!stl) {
    setStatus("STL export failed. Try regenerating.");
    return;
  }
  if (window.api?.saveFile) {
    const result = await window.api.saveFile({
      data: stl,
      encoding: "utf8",
      suggestedName: "branching_sculpture.stl",
      filters: [{ name: "STL", extensions: ["stl"] }],
    });
    if (result && "ok" in result && !result.ok) {
      setStatus("STL export canceled.");
      return;
    }
  } else {
    const blob = new Blob([stl], { type: "model/stl" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "branching_sculpture.stl";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  setStatus("STL exported.");
};

let generateTimer: number | null = null;
const scheduleGenerate = () => {
  if (generateTimer) window.clearTimeout(generateTimer);
  generateTimer = window.setTimeout(() => generate(), 120);
};

let detailTimer: number | null = null;
const scheduleDetailUpdate = () => {
  updateControlLabels();
  updateDepthPreviewLighting();
  if (detailTimer) window.clearTimeout(detailTimer);
  detailTimer = window.setTimeout(() => {
    buildProcessedHeightMap();
    updateDepthStudioPreview();
    buildDepthPreviewTexture();
    if (ui.depthLive.checked) applySurfaceDetail();
  }, 30);
};

let projectionTimer: number | null = null;
const scheduleProjectionUpdate = () => {
  updateControlLabels();
  if (projectionTimer) window.clearTimeout(projectionTimer);
  projectionTimer = window.setTimeout(() => {
    applySurfaceDetail();
  }, 30);
};

const enforceToneRange = (changed: "low" | "high") => {
  let low = Number(ui.carveLow.value);
  let high = Number(ui.carveHigh.value);
  if (changed === "low" && low >= high) {
    high = Math.min(100, low + 1);
    ui.carveHigh.value = String(high);
  }
  if (changed === "high" && high <= low) {
    low = Math.max(0, high - 1);
    ui.carveLow.value = String(low);
  }
};

updateControlLabels();
updateDepthPreviewLighting();
updateModeUI();

ui.generate.addEventListener("click", generate);
ui.texture.addEventListener("click", () => ui.textureInput.click());
ui.export.addEventListener("click", exportStl);
ui.modelMode.addEventListener("change", () => {
  updateModeUI();
  updateControlLabels();
  userHasMovedCamera = false;
  lastCameraState = null;
  scheduleGenerate();
});
ui.textureInput.addEventListener("change", () => {
  const file = ui.textureInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") applyTexture(reader.result);
  };
  reader.readAsDataURL(file);
  ui.textureInput.value = "";
});
ui.branchDensity.addEventListener("input", scheduleGenerate);
ui.thickness.addEventListener("input", () => {
  updateControlLabels();
  scheduleGenerate();
});
ui.branchStyle.addEventListener("change", scheduleGenerate);
ui.branchComplexity.addEventListener("input", () => {
  updateControlLabels();
  scheduleGenerate();
});
ui.branchVariation.addEventListener("input", () => {
  updateControlLabels();
  scheduleGenerate();
});
ui.branchProjection.addEventListener("change", scheduleProjectionUpdate);
ui.etchSize.addEventListener("input", () => {
  updateControlLabels();
  scheduleGenerate();
});
ui.etchGain.addEventListener("input", () => {
  updateControlLabels();
  scheduleDetailUpdate();
});
ui.etchResolution.addEventListener("input", () => {
  updateControlLabels();
  scheduleGenerate();
});
ui.etchMargin.addEventListener("input", scheduleDetailUpdate);
ui.etchAllFaces.addEventListener("change", () => {
  scheduleGenerate();
});
ui.etchWrap.addEventListener("change", () => {
  scheduleGenerate();
});
ui.etchRotation.addEventListener("change", () => {
  updateControlLabels();
  scheduleDetailUpdate();
});
ui.etchFlipX.addEventListener("change", scheduleDetailUpdate);
ui.etchFlipY.addEventListener("change", scheduleDetailUpdate);
ui.carveDepth.addEventListener("input", scheduleDetailUpdate);
ui.carveLow.addEventListener("input", () => {
  enforceToneRange("low");
  scheduleDetailUpdate();
});
ui.carveHigh.addEventListener("input", () => {
  enforceToneRange("high");
  scheduleDetailUpdate();
});
ui.depthBlur.addEventListener("input", scheduleDetailUpdate);
ui.depthGamma.addEventListener("input", scheduleDetailUpdate);
ui.depthContrast.addEventListener("input", scheduleDetailUpdate);
ui.depthRelief.addEventListener("input", scheduleDetailUpdate);
ui.depthMidtone.addEventListener("input", scheduleDetailUpdate);
ui.depthHighpass.addEventListener("input", scheduleDetailUpdate);
ui.depthPosterize.addEventListener("input", scheduleDetailUpdate);
ui.detailEmboss.addEventListener("change", () => {
  scheduleDetailUpdate();
});
ui.depthInvert.addEventListener("change", scheduleDetailUpdate);
ui.depthSmooth.addEventListener("change", scheduleDetailUpdate);
ui.depthRaking.addEventListener("change", () => {
  updateControlLabels();
  updateDepthPreviewLighting();
});
ui.depthLightAngle.addEventListener("input", () => {
  updateControlLabels();
  updateDepthPreviewLighting();
});
ui.depthLive.addEventListener("change", () => {
  if (ui.depthLive.checked) applySurfaceDetail();
});
ui.depthPreview.addEventListener("change", () => {
  updateMaterialPreview();
});
ui.showTexture.addEventListener("change", () => {
  updateMaterialPreview();
});
ui.depthApply.addEventListener("click", () => {
  buildProcessedHeightMap();
  updateDepthStudioPreview();
  buildDepthPreviewTexture();
  applySurfaceDetail();
});

resize();
generate();
render();
