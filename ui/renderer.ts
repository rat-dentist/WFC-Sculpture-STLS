import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ui = {
  canvas: document.getElementById("preview") as HTMLCanvasElement,
  depthCanvas: document.getElementById("depth-canvas") as HTMLCanvasElement,
  status: document.getElementById("status") as HTMLDivElement,
  generate: document.getElementById("btn-generate") as HTMLButtonElement,
  texture: document.getElementById("btn-texture") as HTMLButtonElement,
  export: document.getElementById("btn-export") as HTMLButtonElement,
  depthApply: document.getElementById("depth-apply") as HTMLButtonElement,
  textureInput: document.getElementById("texture-input") as HTMLInputElement,
  shapeMode: document.getElementById("shape-mode") as HTMLSelectElement,
  showTexture: document.getElementById("show-texture") as HTMLInputElement,
  etchSizeControl: document.getElementById("etch-size-control") as HTMLElement,
  etchGainControl: document.getElementById("etch-gain-control") as HTMLElement,
  etchStyleControl: document.getElementById("etch-style-control") as HTMLElement,
  trenchThresholdControl: document.getElementById("trench-threshold-control") as HTMLElement,
  etchMarginControl: document.getElementById("etch-margin-control") as HTMLElement,
  etchResolutionControl: document.getElementById("etch-resolution-control") as HTMLElement,
  etchFacesControl: document.getElementById("etch-faces-control") as HTMLElement,
  etchWrapControl: document.getElementById("etch-wrap-control") as HTMLElement,
  etchFitControl: document.getElementById("etch-fit-control") as HTMLElement,
  textureRepeatControl: document.getElementById("texture-repeat-control") as HTMLElement,
  textureTilesControl: document.getElementById("texture-tiles-control") as HTMLElement,
  etchRotateControl: document.getElementById("etch-rotate-control") as HTMLElement,
  etchOffsetXControl: document.getElementById("etch-offsetx-control") as HTMLElement,
  etchOffsetYControl: document.getElementById("etch-offsety-control") as HTMLElement,
  etchFlipXControl: document.getElementById("etch-flipx-control") as HTMLElement,
  etchFlipYControl: document.getElementById("etch-flipy-control") as HTMLElement,
  etchSize: document.getElementById("etch-size") as HTMLInputElement,
  etchSizeValue: document.getElementById("etch-size-value") as HTMLSpanElement,
  rectWidthControl: document.getElementById("rect-width-control") as HTMLElement,
  rectWidth: document.getElementById("rect-width") as HTMLInputElement,
  rectWidthValue: document.getElementById("rect-width-value") as HTMLSpanElement,
  rectHeightControl: document.getElementById("rect-height-control") as HTMLElement,
  rectHeight: document.getElementById("rect-height") as HTMLInputElement,
  rectHeightValue: document.getElementById("rect-height-value") as HTMLSpanElement,
  rectDepthControl: document.getElementById("rect-depth-control") as HTMLElement,
  rectDepth: document.getElementById("rect-depth") as HTMLInputElement,
  rectDepthValue: document.getElementById("rect-depth-value") as HTMLSpanElement,
  wallThicknessControl: document.getElementById("wall-thickness-control") as HTMLElement,
  wallThickness: document.getElementById("wall-thickness") as HTMLInputElement,
  wallThicknessValue: document.getElementById("wall-thickness-value") as HTMLSpanElement,
  etchGain: document.getElementById("etch-gain") as HTMLInputElement,
  etchGainValue: document.getElementById("etch-gain-value") as HTMLSpanElement,
  etchStyle: document.getElementById("etch-style") as HTMLSelectElement,
  trenchThreshold: document.getElementById("trench-threshold") as HTMLInputElement,
  trenchThresholdValue: document.getElementById("trench-threshold-value") as HTMLSpanElement,
  etchMargin: document.getElementById("etch-margin") as HTMLInputElement,
  etchMarginValue: document.getElementById("etch-margin-value") as HTMLSpanElement,
  etchResolution: document.getElementById("etch-resolution") as HTMLInputElement,
  etchResolutionValue: document.getElementById("etch-resolution-value") as HTMLSpanElement,
  etchAllFaces: document.getElementById("etch-all-faces") as HTMLInputElement,
  etchWrap: document.getElementById("etch-wrap") as HTMLSelectElement,
  etchFitFace: document.getElementById("etch-fit-face") as HTMLInputElement,
  textureRepeat: document.getElementById("texture-repeat") as HTMLInputElement,
  textureTiles: document.getElementById("texture-tiles") as HTMLInputElement,
  textureTilesValue: document.getElementById("texture-tiles-value") as HTMLSpanElement,
  etchRotation: document.getElementById("etch-rotation") as HTMLSelectElement,
  etchOffsetX: document.getElementById("etch-offset-x") as HTMLInputElement,
  etchOffsetXValue: document.getElementById("etch-offset-x-value") as HTMLSpanElement,
  etchOffsetY: document.getElementById("etch-offset-y") as HTMLInputElement,
  etchOffsetYValue: document.getElementById("etch-offset-y-value") as HTMLSpanElement,
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
  depthStudioMode: document.getElementById("depth-studio-mode") as HTMLSelectElement,
};

let currentGeometry: THREE.BufferGeometry | null = null;
const buttonLabels = new Map<HTMLButtonElement, string>();
let isGenerating = false;
let userHasMovedCamera = false;
let suppressCameraEvents = false;
let lastCameraState: { position: THREE.Vector3; target: THREE.Vector3 } | null = null;

type HeightMap = {
  width: number;
  height: number;
  values: Float32Array;
};

type ColorMap = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

let activeHeightMapRaw: HeightMap | null = null;
let activeHeightMapProcessed: HeightMap | null = null;
let activeHeightMapSmoothed: HeightMap | null = null;
let activeTextureColorMap: ColorMap | null = null;
let activeTexture: THREE.Texture | null = null;
let activeDepthPreviewTexture: THREE.Texture | null = null;
let activeDepthStudioTexture: THREE.Texture | null = null;
let rectKitbash: BranchBlock[] | null = null;
let forceBranchRandomize = false;
const DEPTH_STUDIO_2D_PREVIEW = true;

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
const depthCamera = DEPTH_STUDIO_2D_PREVIEW
  ? new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  : new THREE.PerspectiveCamera(35, 1, 0.1, 200);
if (DEPTH_STUDIO_2D_PREVIEW) {
  depthCamera.position.set(0, 0, 2);
  depthCamera.lookAt(0, 0, 0);
} else {
  depthCamera.position.set(9, 7.2, 9);
  depthCamera.lookAt(0, 0, 0);
}
const depthLightA = new THREE.DirectionalLight(0xffffff, 0.9);
depthLightA.position.set(8, 10, 6);
const depthLightB = new THREE.DirectionalLight(0xffffff, 0.35);
depthLightB.position.set(-6, 4, -4);
const depthAmbient = new THREE.AmbientLight(0xffffff, 0.25);
if (DEPTH_STUDIO_2D_PREVIEW) {
  depthLightA.intensity = 0;
  depthLightB.intensity = 0;
  depthAmbient.intensity = 1;
}
depthScene.add(depthLightA, depthLightB, depthAmbient);

const updateDepthPreviewLighting = () => {
  if (DEPTH_STUDIO_2D_PREVIEW) return;
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
const depthPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(
    DEPTH_STUDIO_2D_PREVIEW ? 2 : 10,
    DEPTH_STUDIO_2D_PREVIEW ? 2 : 10,
    DEPTH_STUDIO_2D_PREVIEW ? 1 : 128,
    DEPTH_STUDIO_2D_PREVIEW ? 1 : 128
  ),
  depthMaterial
);
if (!DEPTH_STUDIO_2D_PREVIEW) {
  depthPlane.rotation.x = -Math.PI / 5.5;
  depthPlane.position.y = -0.5;
}
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
    if (depthCamera instanceof THREE.PerspectiveCamera) {
      depthCamera.aspect = depthWidth / depthHeight;
    } else {
      const aspect = depthWidth / depthHeight;
      if (aspect >= 1) {
        depthCamera.left = -aspect;
        depthCamera.right = aspect;
        depthCamera.top = 1;
        depthCamera.bottom = -1;
      } else {
        depthCamera.left = -1;
        depthCamera.right = 1;
        depthCamera.top = 1 / aspect;
        depthCamera.bottom = -1 / aspect;
      }
    }
    depthCamera.updateProjectionMatrix();
  }
};

window.addEventListener("resize", resize);

const setStatus = (message: string) => {
  ui.status.textContent = message;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const wrap01 = (value: number) => {
  const wrapped = value - Math.floor(value);
  return wrapped < 0 ? wrapped + 1 : wrapped;
};

type DetailMode = "carve" | "emboss";
type ShapeMode = "cube" | "rect";
type EtchStyle = "relief" | "trench";
type WrapMode = "face" | "sides" | "global";
type BranchBlock = {
  centerX: number;
  centerY: number;
  centerZ: number;
  widthMm: number;
  heightMm: number;
  depthMm: number;
};

const getDetailMode = (): DetailMode => (ui.detailEmboss.checked ? "emboss" : "carve");
const getShapeMode = (): ShapeMode => (ui.shapeMode.value === "rect" ? "rect" : "cube");

const getEtchSettings = () => ({
  cubeSizeMm: Number(ui.etchSize.value),
  marginMm: Number(ui.etchMargin.value),
  resolution: Number(ui.etchResolution.value),
  depthGain: Number(ui.etchGain.value),
  etchStyle: (ui.etchStyle.value === "trench" ? "trench" : "relief") as EtchStyle,
  trenchThreshold: Number(ui.trenchThreshold.value) / 100,
  allFaces: ui.etchAllFaces.checked,
  wrapMode: (
    ui.etchWrap.value === "global"
      ? "global"
      : ui.etchWrap.value === "sides"
        ? "sides"
        : "face"
  ) as WrapMode,
  fitToVisibleFace: ui.etchFitFace.checked,
  textureRepeat: ui.textureRepeat.checked,
  textureTiles: Number(ui.textureTiles.value),
  rotation: Number(ui.etchRotation.value),
  offsetX: Number(ui.etchOffsetX.value) / 100,
  offsetY: Number(ui.etchOffsetY.value) / 100,
  flipX: ui.etchFlipX.checked,
  flipY: ui.etchFlipY.checked,
});

const getShellSettings = () => ({
  wallThicknessMm: Number(ui.wallThickness.value),
});

const getShapeDimensions = () => {
  const shape = getShapeMode();
  if (shape === "rect") {
    return {
      shape,
      widthMm: Number(ui.rectWidth.value),
      heightMm: Number(ui.rectHeight.value),
      depthMm: Number(ui.rectDepth.value),
    };
  }
  const cubeSizeMm = Number(ui.etchSize.value);
  return {
    shape,
    widthMm: cubeSizeMm,
    heightMm: cubeSizeMm,
    depthMm: cubeSizeMm,
  };
};

const randBetween = (min: number, max: number) => {
  if (min >= max) return min;
  return min + Math.random() * (max - min);
};

const makeRectKitbash = (wallThicknessMm: number): BranchBlock[] => {
  const { widthMm, heightMm, depthMm } = getShapeDimensions();
  const base: BranchBlock = { centerX: 0, centerY: 0, centerZ: 0, widthMm, heightMm, depthMm };
  const blocks: BranchBlock[] = [];
  const blockCount = 3 + Math.floor(Math.random() * 6);

  const pickFaceSize = (baseSize: number) => {
    const raw = baseSize * randBetween(0.3, 0.85);
    return Math.max(16, Math.min(baseSize * 0.9, raw));
  };
  const pickDepth = (baseSize: number) => {
    const raw = baseSize * randBetween(0.2, 0.65);
    return Math.max(16, Math.min(baseSize * 0.85, raw));
  };
  const pickOverlap = (depth: number) => {
    const minOverlap = Math.max(4, wallThicknessMm * 1.2);
    const overlap = Math.max(minOverlap, depth * 0.25);
    return Math.min(overlap, depth * 0.5);
  };

  const addAttachment = (target: BranchBlock): BranchBlock => {
    const halfX = target.widthMm * 0.5;
    const halfY = target.heightMm * 0.5;
    const halfZ = target.depthMm * 0.5;
    const face = Math.floor(Math.random() * 6);

    if (face === 0 || face === 1) {
      const w = pickFaceSize(target.widthMm);
      const h = pickFaceSize(target.heightMm);
      const d = pickDepth(target.depthMm);
      const overlap = pickOverlap(d);
      const cx = randBetween(-halfX + w * 0.5, halfX - w * 0.5);
      const cy = randBetween(-halfY + h * 0.5, halfY - h * 0.5);
      const cz = target.centerZ + (face === 0 ? 1 : -1) * (halfZ + d * 0.5 - overlap);
      return { centerX: target.centerX + cx, centerY: target.centerY + cy, centerZ: cz, widthMm: w, heightMm: h, depthMm: d };
    }

    if (face === 2 || face === 3) {
      const w = pickDepth(target.widthMm);
      const h = pickFaceSize(target.heightMm);
      const d = pickFaceSize(target.depthMm);
      const overlap = pickOverlap(w);
      const cz = randBetween(-halfZ + d * 0.5, halfZ - d * 0.5);
      const cy = randBetween(-halfY + h * 0.5, halfY - h * 0.5);
      const cx = target.centerX + (face === 2 ? 1 : -1) * (halfX + w * 0.5 - overlap);
      return { centerX: cx, centerY: target.centerY + cy, centerZ: target.centerZ + cz, widthMm: w, heightMm: h, depthMm: d };
    }

    const w = pickFaceSize(target.widthMm);
    const h = pickDepth(target.heightMm);
    const d = pickFaceSize(target.depthMm);
    const overlap = pickOverlap(h);
    const cx = randBetween(-halfX + w * 0.5, halfX - w * 0.5);
    const cz = randBetween(-halfZ + d * 0.5, halfZ - d * 0.5);
    const cy = target.centerY + (face === 4 ? 1 : -1) * (halfY + h * 0.5 - overlap);
    return { centerX: target.centerX + cx, centerY: cy, centerZ: target.centerZ + cz, widthMm: w, heightMm: h, depthMm: d };
  };

  for (let i = 0; i < blockCount; i += 1) {
    const anchor = blocks.length > 0 && Math.random() < 0.35 ? blocks[Math.floor(Math.random() * blocks.length)] : base;
    blocks.push(addAttachment(anchor));
  }

  return blocks;
};

const updateModeUI = () => {
  const shape = getShapeMode();
  const cubeMode = shape === "cube";
  const faceWrapMode = ui.etchWrap.value === "face";
  ui.etchSizeControl.classList.toggle("hidden", !cubeMode);
  ui.rectWidthControl.classList.toggle("hidden", cubeMode);
  ui.rectHeightControl.classList.toggle("hidden", cubeMode);
  ui.rectDepthControl.classList.toggle("hidden", cubeMode);
  ui.etchGainControl.classList.toggle("hidden", false);
  ui.etchStyleControl.classList.toggle("hidden", false);
  ui.trenchThresholdControl.classList.toggle("hidden", ui.etchStyle.value !== "trench");
  ui.etchMarginControl.classList.toggle("hidden", false);
  ui.etchResolutionControl.classList.toggle("hidden", false);
  ui.etchWrapControl.classList.toggle("hidden", false);
  ui.etchFitControl.classList.toggle("hidden", !faceWrapMode);
  ui.textureRepeatControl.classList.toggle("hidden", false);
  ui.textureTilesControl.classList.toggle("hidden", !ui.textureRepeat.checked);
  ui.etchFacesControl.classList.toggle("hidden", false);
  ui.etchRotateControl.classList.toggle("hidden", false);
  ui.etchOffsetXControl.classList.toggle("hidden", false);
  ui.etchOffsetYControl.classList.toggle("hidden", false);
  ui.etchFlipXControl.classList.toggle("hidden", false);
  ui.etchFlipYControl.classList.toggle("hidden", false);
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
  ui.etchSizeValue.textContent = ui.etchSize.value;
  ui.rectWidthValue.textContent = ui.rectWidth.value;
  ui.rectHeightValue.textContent = ui.rectHeight.value;
  ui.rectDepthValue.textContent = ui.rectDepth.value;
  ui.wallThicknessValue.textContent = Number(ui.wallThickness.value).toFixed(1);
  ui.etchGainValue.textContent = Number(ui.etchGain.value).toFixed(1);
  ui.trenchThresholdValue.textContent = ui.trenchThreshold.value;
  ui.etchMarginValue.textContent = Number(ui.etchMargin.value).toFixed(1);
  ui.etchResolutionValue.textContent = ui.etchResolution.value;
  ui.textureTilesValue.textContent = ui.textureTiles.value;
  ui.etchOffsetXValue.textContent = ui.etchOffsetX.value;
  ui.etchOffsetYValue.textContent = ui.etchOffsetY.value;
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

const extractColorMap = (image: HTMLImageElement): ColorMap => {
  const maxDim = 1024;
  const scale = Math.min(1, maxDim / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { width: 1, height: 1, data: new Uint8ClampedArray([255, 255, 255, 255]) };
  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  return { width, height, data };
};

const USE_LEGACY_SAMPLING = false;
let warnedGlobalUvOutOfRange = false;

const sampleHeightMapBilinear = (map: HeightMap, u: number, v: number) => {
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

const sampleHeightMapNearest = (map: HeightMap, u: number, v: number) => {
  const uu = clamp01(u);
  const vv = clamp01(v);
  const x = Math.round(uu * (map.width - 1));
  const y = Math.round(vv * (map.height - 1));
  return map.values[x + y * map.width];
};

const sampleColorMapBilinear = (map: ColorMap, u: number, v: number) => {
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

  const idx00 = (x0 + y0 * map.width) * 4;
  const idx10 = (x1 + y0 * map.width) * 4;
  const idx01 = (x0 + y1 * map.width) * 4;
  const idx11 = (x1 + y1 * map.width) * 4;

  const out: [number, number, number, number] = [0, 0, 0, 0];
  for (let c = 0; c < 4; c += 1) {
    const a = map.data[idx00 + c] * (1 - tx) + map.data[idx10 + c] * tx;
    const b = map.data[idx01 + c] * (1 - tx) + map.data[idx11 + c] * tx;
    out[c] = a * (1 - ty) + b * ty;
  }
  return out;
};

const sampleDetailHeight = (map: HeightMap, u: number, v: number) =>
  USE_LEGACY_SAMPLING ? sampleHeightMapNearest(map, u, v) : sampleHeightMapBilinear(map, u, v);

const shouldUseRepeatWrapping = (textureRepeat: boolean, textureTiles: number, wrapMode: WrapMode) =>
  wrapMode === "global" ? textureRepeat && textureTiles > 1 : textureRepeat;

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

type UvTransformMode = "repeat" | "clamp" | "continuous";

const transformUv = (
  u: number,
  v: number,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
  textureTiles: number,
  offsetX: number,
  offsetY: number,
  mode: UvTransformMode = "repeat"
) => {
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
  const tiles = Math.max(1, textureTiles);
  uu *= tiles;
  vv *= tiles;
  uu += offsetX;
  vv += offsetY;
  if (mode === "repeat") {
    uu = wrap01(uu);
    vv = wrap01(vv);
  } else if (mode === "clamp") {
    uu = clamp01(uu);
    vv = clamp01(vv);
  }
  return [uu, vv];
};

const sampleHeightMapTransformed = (
  map: HeightMap,
  u: number,
  v: number,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
  textureRepeat: boolean,
  textureTiles: number,
  offsetX: number,
  offsetY: number,
  wrapMode: WrapMode
) => {
  const mode: UvTransformMode = shouldUseRepeatWrapping(textureRepeat, textureTiles, wrapMode) ? "repeat" : "clamp";
  const [uu, vv] = transformUv(u, v, rotation, flipX, flipY, textureTiles, offsetX, offsetY, mode);
  return sampleDetailHeight(map, uu, vv);
};

const sampleColorMapTransformed = (
  map: ColorMap,
  u: number,
  v: number,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
  textureRepeat: boolean,
  textureTiles: number,
  offsetX: number,
  offsetY: number,
  wrapMode: WrapMode
) => {
  const mode: UvTransformMode = shouldUseRepeatWrapping(textureRepeat, textureTiles, wrapMode) ? "repeat" : "clamp";
  const [uu, vv] = transformUv(u, v, rotation, flipX, flipY, textureTiles, offsetX, offsetY, mode);
  return sampleColorMapBilinear(map, uu, vv);
};

const sampleWrappedUv = (
  pos: THREE.Vector3,
  widthMm: number,
  heightMm: number,
  depthMm: number,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
  textureTiles: number,
  offsetX: number,
  offsetY: number,
  mode: UvTransformMode = "repeat"
) => {
  const halfY = heightMm * 0.5;
  const angle = Math.atan2(pos.z, pos.x);
  let u = angle / (Math.PI * 2) + 0.5;
  let v = (pos.y + halfY) / Math.max(1e-6, heightMm);
  u = clamp01(u);
  v = clamp01(v);
  return transformUv(u, v, rotation, flipX, flipY, textureTiles, offsetX, offsetY, mode);
};

const clampUvEdge = (value: number) => Math.min(0.999999, Math.max(0.000001, value));

const computeGlobalUv = (worldPos: THREE.Vector3, normal: THREE.Vector3, bounds: THREE.Box3) => {
  const spanX = Math.max(1e-6, bounds.max.x - bounds.min.x);
  const spanY = Math.max(1e-6, bounds.max.y - bounds.min.y);
  const spanZ = Math.max(1e-6, bounds.max.z - bounds.min.z);

  const u = (worldPos.x - bounds.min.x) / spanX;
  const v = (worldPos.y - bounds.min.y) / spanY;
  const w = (worldPos.z - bounds.min.z) / spanZ;

  const ax = Math.abs(normal.x);
  const ay = Math.abs(normal.y);
  const az = Math.abs(normal.z);

  let uvU = u;
  let uvV = v;
  if (ay >= ax && ay >= az) {
    uvU = u;
    uvV = w;
  } else if (ax >= ay && ax >= az) {
    uvU = w;
    uvV = v;
  } else {
    uvU = u;
    uvV = v;
  }

  if (!warnedGlobalUvOutOfRange && (uvU < -1e-4 || uvU > 1.0001 || uvV < -1e-4 || uvV > 1.0001)) {
    warnedGlobalUvOutOfRange = true;
    console.warn("Global UV out of [0,1] before wrapping; clamping to safe range.");
  }

  return [clampUvEdge(clamp01(uvU)), clampUvEdge(clamp01(uvV))] as [number, number];
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
    const etchMode = true;
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

const getTextureWrapMode = (repeat: boolean, textureTiles: number, wrapMode: WrapMode) =>
  shouldUseRepeatWrapping(repeat, textureTiles, wrapMode) ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
const syncTextureWrapModes = () => {
  const { textureRepeat, textureTiles, wrapMode } = getEtchSettings();
  const textureWrapMode = getTextureWrapMode(textureRepeat, textureTiles, wrapMode);
  const applyWrap = (texture: THREE.Texture | null) => {
    if (!texture) return;
    texture.wrapS = textureWrapMode;
    texture.wrapT = textureWrapMode;
    texture.needsUpdate = true;
  };
  applyWrap(activeTexture);
  applyWrap(activeDepthStudioTexture);
  applyWrap(activeDepthPreviewTexture);
};

const updateDepthStudioPreview = () => {
  const previewMap = getActiveDetailMap();
  const {
    rotation,
    flipX,
    flipY,
    textureRepeat,
    textureTiles,
    offsetX,
    offsetY,
    etchStyle,
    trenchThreshold,
    wrapMode,
  } = getEtchSettings();

  const previewMode = (
    ui.depthStudioMode.value === "heightmap"
      ? "heightmap"
      : ui.depthStudioMode.value === "trench"
        ? "trench"
        : "texture"
  ) as "texture" | "heightmap" | "trench";

  const renderFlatPreview = () => {
    const textureSource = activeTextureColorMap;
    const mapSource = previewMap;
    if (!textureSource && !mapSource) {
      if (activeDepthStudioTexture) {
        activeDepthStudioTexture.dispose();
        activeDepthStudioTexture = null;
      }
      depthMaterial.displacementMap = null;
      depthMaterial.displacementScale = 0;
      depthMaterial.displacementBias = 0;
      depthMaterial.map = activeTexture;
      depthMaterial.needsUpdate = true;
      return;
    }

    let width = 512;
    let height = 512;
    if (previewMode === "texture" && textureSource) {
      width = textureSource.width;
      height = textureSource.height;
    } else if (mapSource) {
      width = mapSource.width;
      height = mapSource.height;
    } else if (textureSource) {
      width = textureSource.width;
      height = textureSource.height;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("2D context unavailable for Depth Studio preview.");
    const img = ctx.createImageData(width, height);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const u = width > 1 ? x / (width - 1) : 0.5;
        const v = height > 1 ? y / (height - 1) : 0.5;
        const p = (x + y * width) * 4;

        if (previewMode === "texture" && textureSource) {
          const [r, g, b, a] = sampleColorMapTransformed(
            textureSource,
            u,
            v,
            rotation,
            flipX,
            flipY,
            textureRepeat,
            textureTiles,
            offsetX,
            offsetY,
            wrapMode
          );
          img.data[p] = Math.round(r);
          img.data[p + 1] = Math.round(g);
          img.data[p + 2] = Math.round(b);
          img.data[p + 3] = Math.round(a);
          continue;
        }

        let tone = mapSource
          ? sampleHeightMapTransformed(
              mapSource,
              u,
              v,
              rotation,
              flipX,
              flipY,
              textureRepeat,
              textureTiles,
              offsetX,
              offsetY,
              wrapMode
            )
          : 0.5;
        if (previewMode === "trench") {
          tone = tone >= trenchThreshold ? 1 : 0;
        }
        const vv = Math.round(tone * 255);
        img.data[p] = vv;
        img.data[p + 1] = vv;
        img.data[p + 2] = vv;
        img.data[p + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
    if (activeDepthStudioTexture) activeDepthStudioTexture.dispose();
    const tex = new THREE.CanvasTexture(canvas);
    const textureWrapMode = getTextureWrapMode(textureRepeat, textureTiles, wrapMode);
    tex.wrapS = textureWrapMode;
    tex.wrapT = textureWrapMode;
    tex.needsUpdate = true;
    activeDepthStudioTexture = tex;

    depthMaterial.displacementMap = null;
    depthMaterial.displacementScale = 0;
    depthMaterial.displacementBias = 0;
    depthMaterial.map = activeDepthStudioTexture;
    depthMaterial.needsUpdate = true;
  };

  if (DEPTH_STUDIO_2D_PREVIEW) {
    try {
      renderFlatPreview();
      return;
    } catch (error) {
      console.warn("Depth Studio 2D preview failed; falling back to legacy studio preview.", error);
    }
  }

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
      let tone = sampleHeightMapTransformed(previewMap, u, v, rotation, flipX, flipY, textureRepeat, textureTiles, offsetX, offsetY, wrapMode);
      if (etchStyle === "trench") tone = tone >= trenchThreshold ? 1 : 0;
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
  const textureWrapMode = getTextureWrapMode(textureRepeat, textureTiles, wrapMode);
  tex.wrapS = textureWrapMode;
  tex.wrapT = textureWrapMode;
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
  const { rotation, flipX, flipY, textureRepeat, textureTiles, offsetX, offsetY, etchStyle, trenchThreshold, wrapMode } = getEtchSettings();
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
      let tone = sampleHeightMapTransformed(previewMap, u, v, rotation, flipX, flipY, textureRepeat, textureTiles, offsetX, offsetY, wrapMode);
      if (etchStyle === "trench") tone = tone >= trenchThreshold ? 1 : 0;
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
  const textureWrapMode = getTextureWrapMode(textureRepeat, textureTiles, wrapMode);
  tex.wrapS = textureWrapMode;
  tex.wrapT = textureWrapMode;
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
      const { textureRepeat, textureTiles, wrapMode } = getEtchSettings();
      const textureWrapMode = getTextureWrapMode(textureRepeat, textureTiles, wrapMode);
      texture.wrapS = textureWrapMode;
      texture.wrapT = textureWrapMode;
      texture.repeat.set(1, 1);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      if (activeTexture) activeTexture.dispose();
      activeTexture = texture;
      updateMaterialPreview();

      const image = new Image();
      image.onload = () => {
        activeTextureColorMap = extractColorMap(image);
        activeHeightMapRaw = extractHeightMap(image);
        buildProcessedHeightMap();
        updateDepthStudioPreview();
        buildDepthPreviewTexture();
        if (ui.depthLive.checked) applySurfaceDetail();
        setStatus("Texture and depth map applied.");
      };
      image.onerror = () => {
        activeTextureColorMap = null;
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

const buildEtchedBlockGeometry = (map: HeightMap | null) => {
  const {
    marginMm,
    resolution,
    depthGain,
    allFaces,
    wrapMode,
    fitToVisibleFace,
    textureRepeat,
    textureTiles,
    rotation,
    flipX,
    flipY,
    offsetX,
    offsetY,
    etchStyle,
    trenchThreshold,
  } = getEtchSettings();
  const { widthMm, heightMm, depthMm } = getShapeDimensions();
  const { maxDepth } = getCarveSettings();
  const mode = getDetailMode();
  const sign = mode === "emboss" ? 1 : -1;
  const seg = Math.max(16, Math.min(512, Math.round(resolution)));
  const softMargin = Math.max(0.25, Math.min(2.5, marginMm * 0.25));

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const blocks: BranchBlock[] = [
    { centerX: 0, centerY: 0, centerZ: 0, widthMm, heightMm, depthMm },
    ...(rectKitbash ?? []),
  ];
  const globalBounds = new THREE.Box3();
  for (const block of blocks) {
    const hx = block.widthMm * 0.5;
    const hy = block.heightMm * 0.5;
    const hz = block.depthMm * 0.5;
    globalBounds.expandByPoint(new THREE.Vector3(block.centerX - hx, block.centerY - hy, block.centerZ - hz));
    globalBounds.expandByPoint(new THREE.Vector3(block.centerX + hx, block.centerY + hy, block.centerZ + hz));
  }
  const globalSpan = new THREE.Vector3();
  globalBounds.getSize(globalSpan);
  const hasValidGlobalBounds = globalSpan.x > 1e-6 && globalSpan.y > 1e-6 && globalSpan.z > 1e-6;
  const globalWrapEnabled = wrapMode === "global" && hasValidGlobalBounds;
  const repeatWrapEnabled = shouldUseRepeatWrapping(textureRepeat, textureTiles, wrapMode);
  if (wrapMode === "global" && !hasValidGlobalBounds) {
    console.warn("Global seamless wrap requested but bounds were invalid; falling back to per-face projection.");
  }

  const projectGlobalUv = (point: THREE.Vector3, normal: THREE.Vector3, uvMode: UvTransformMode) => {
    const [u, v] = computeGlobalUv(point, normal, globalBounds);
    return transformUv(u, v, rotation, flipX, flipY, textureTiles, offsetX, offsetY, uvMode);
  };

  type FaceSpec = {
    origin: THREE.Vector3;
    uDir: THREE.Vector3;
    vDir: THREE.Vector3;
    normal: THREE.Vector3;
    w: number;
    h: number;
    faceId: number;
    blockIndex: number;
  };

  const isPointInsideBlockCoords = (x: number, y: number, z: number, block: BranchBlock, eps = 1e-4) => {
    const hx = block.widthMm * 0.5 + eps;
    const hy = block.heightMm * 0.5 + eps;
    const hz = block.depthMm * 0.5 + eps;
    return (
      x >= block.centerX - hx &&
      x <= block.centerX + hx &&
      y >= block.centerY - hy &&
      y <= block.centerY + hy &&
      z >= block.centerZ - hz &&
      z <= block.centerZ + hz
    );
  };

  const isPointInsideBlock = (p: THREE.Vector3, block: BranchBlock, eps = 1e-4) =>
    isPointInsideBlockCoords(p.x, p.y, p.z, block, eps);

  const faceCorners = (face: FaceSpec) => {
    const halfW = face.w * 0.5;
    const halfH = face.h * 0.5;
    const c0 = face.origin.clone().addScaledVector(face.uDir, -halfW).addScaledVector(face.vDir, -halfH);
    const c1 = face.origin.clone().addScaledVector(face.uDir, halfW).addScaledVector(face.vDir, -halfH);
    const c2 = face.origin.clone().addScaledVector(face.uDir, halfW).addScaledVector(face.vDir, halfH);
    const c3 = face.origin.clone().addScaledVector(face.uDir, -halfW).addScaledVector(face.vDir, halfH);
    return [c0, c1, c2, c3];
  };

  const isFaceInternal = (face: FaceSpec, blockSet: BranchBlock[]) => {
    const corners = faceCorners(face);
    for (let i = 0; i < blockSet.length; i += 1) {
      if (i === face.blockIndex) continue;
      const block = blockSet[i];
      let inside = true;
      for (const c of corners) {
        if (!isPointInsideBlock(c, block)) {
          inside = false;
          break;
        }
      }
      if (inside) return true;
    }
    return false;
  };

  const overlapsRange = (minA: number, maxA: number, minB: number, maxB: number) => minA <= maxB && maxA >= minB;

  const getOverlapBlocks = (face: FaceSpec, blockSet: BranchBlock[]) => {
    const eps = 1e-4;
    const overlapBlocks: BranchBlock[] = [];
    const absX = Math.abs(face.normal.x);
    const absY = Math.abs(face.normal.y);
    const axis: "x" | "y" | "z" = absX > 0.5 ? "x" : absY > 0.5 ? "y" : "z";

    if (axis === "x") {
      const plane = face.origin.x;
      const faceMinY = face.origin.y - face.h * 0.5;
      const faceMaxY = face.origin.y + face.h * 0.5;
      const faceMinZ = face.origin.z - face.w * 0.5;
      const faceMaxZ = face.origin.z + face.w * 0.5;
      for (let i = 0; i < blockSet.length; i += 1) {
        if (i === face.blockIndex) continue;
        const block = blockSet[i];
        const minX = block.centerX - block.widthMm * 0.5;
        const maxX = block.centerX + block.widthMm * 0.5;
        const minY = block.centerY - block.heightMm * 0.5;
        const maxY = block.centerY + block.heightMm * 0.5;
        const minZ = block.centerZ - block.depthMm * 0.5;
        const maxZ = block.centerZ + block.depthMm * 0.5;
        if (
          plane >= minX - eps &&
          plane <= maxX + eps &&
          overlapsRange(minY, maxY, faceMinY, faceMaxY) &&
          overlapsRange(minZ, maxZ, faceMinZ, faceMaxZ)
        ) {
          overlapBlocks.push(block);
        }
      }
      return overlapBlocks;
    }

    if (axis === "y") {
      const plane = face.origin.y;
      const faceMinX = face.origin.x - face.w * 0.5;
      const faceMaxX = face.origin.x + face.w * 0.5;
      const faceMinZ = face.origin.z - face.h * 0.5;
      const faceMaxZ = face.origin.z + face.h * 0.5;
      for (let i = 0; i < blockSet.length; i += 1) {
        if (i === face.blockIndex) continue;
        const block = blockSet[i];
        const minX = block.centerX - block.widthMm * 0.5;
        const maxX = block.centerX + block.widthMm * 0.5;
        const minY = block.centerY - block.heightMm * 0.5;
        const maxY = block.centerY + block.heightMm * 0.5;
        const minZ = block.centerZ - block.depthMm * 0.5;
        const maxZ = block.centerZ + block.depthMm * 0.5;
        if (
          plane >= minY - eps &&
          plane <= maxY + eps &&
          overlapsRange(minX, maxX, faceMinX, faceMaxX) &&
          overlapsRange(minZ, maxZ, faceMinZ, faceMaxZ)
        ) {
          overlapBlocks.push(block);
        }
      }
      return overlapBlocks;
    }

    const plane = face.origin.z;
    const faceMinX = face.origin.x - face.w * 0.5;
    const faceMaxX = face.origin.x + face.w * 0.5;
    const faceMinY = face.origin.y - face.h * 0.5;
    const faceMaxY = face.origin.y + face.h * 0.5;
    for (let i = 0; i < blockSet.length; i += 1) {
      if (i === face.blockIndex) continue;
      const block = blockSet[i];
      const minX = block.centerX - block.widthMm * 0.5;
      const maxX = block.centerX + block.widthMm * 0.5;
      const minY = block.centerY - block.heightMm * 0.5;
      const maxY = block.centerY + block.heightMm * 0.5;
      const minZ = block.centerZ - block.depthMm * 0.5;
      const maxZ = block.centerZ + block.depthMm * 0.5;
      if (
        plane >= minZ - eps &&
        plane <= maxZ + eps &&
        overlapsRange(minX, maxX, faceMinX, faceMaxX) &&
        overlapsRange(minY, maxY, faceMinY, faceMaxY)
      ) {
        overlapBlocks.push(block);
      }
    }
    return overlapBlocks;
  };

  const buildFaceSpecs = (block: BranchBlock, blockIndex: number): FaceSpec[] => {
    const hx = block.widthMm * 0.5;
    const hy = block.heightMm * 0.5;
    const hz = block.depthMm * 0.5;
    return [
      { origin: new THREE.Vector3(block.centerX, block.centerY, block.centerZ + hz), uDir: new THREE.Vector3(1, 0, 0), vDir: new THREE.Vector3(0, -1, 0), normal: new THREE.Vector3(0, 0, 1), w: block.widthMm, h: block.heightMm, faceId: 0, blockIndex },
      { origin: new THREE.Vector3(block.centerX, block.centerY, block.centerZ - hz), uDir: new THREE.Vector3(-1, 0, 0), vDir: new THREE.Vector3(0, -1, 0), normal: new THREE.Vector3(0, 0, -1), w: block.widthMm, h: block.heightMm, faceId: 1, blockIndex },
      { origin: new THREE.Vector3(block.centerX + hx, block.centerY, block.centerZ), uDir: new THREE.Vector3(0, 0, -1), vDir: new THREE.Vector3(0, -1, 0), normal: new THREE.Vector3(1, 0, 0), w: block.depthMm, h: block.heightMm, faceId: 2, blockIndex },
      { origin: new THREE.Vector3(block.centerX - hx, block.centerY, block.centerZ), uDir: new THREE.Vector3(0, 0, 1), vDir: new THREE.Vector3(0, -1, 0), normal: new THREE.Vector3(-1, 0, 0), w: block.depthMm, h: block.heightMm, faceId: 3, blockIndex },
      { origin: new THREE.Vector3(block.centerX, block.centerY + hy, block.centerZ), uDir: new THREE.Vector3(1, 0, 0), vDir: new THREE.Vector3(0, 0, 1), normal: new THREE.Vector3(0, 1, 0), w: block.widthMm, h: block.depthMm, faceId: 4, blockIndex },
      { origin: new THREE.Vector3(block.centerX, block.centerY - hy, block.centerZ), uDir: new THREE.Vector3(1, 0, 0), vDir: new THREE.Vector3(0, 0, -1), normal: new THREE.Vector3(0, -1, 0), w: block.widthMm, h: block.depthMm, faceId: 5, blockIndex },
    ];
  };

  const addQuadWithUvs = (
    v0: THREE.Vector3,
    v1: THREE.Vector3,
    v2: THREE.Vector3,
    v3: THREE.Vector3,
    uv0: [number, number],
    uv1: [number, number],
    uv2: [number, number],
    uv3: [number, number],
    desiredNormal: THREE.Vector3,
    invertWinding: boolean
  ) => {
    const baseIndex = positions.length / 3;
    positions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
    uvs.push(uv0[0], uv0[1], uv1[0], uv1[1], uv2[0], uv2[1], uv3[0], uv3[1]);

    const ax = v1.x - v0.x;
    const ay = v1.y - v0.y;
    const az = v1.z - v0.z;
    const bx = v2.x - v0.x;
    const by = v2.y - v0.y;
    const bz = v2.z - v0.z;
    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;
    const dot = nx * desiredNormal.x + ny * desiredNormal.y + nz * desiredNormal.z;
    const flip = invertWinding ? dot > 0 : dot < 0;

    const i0 = baseIndex;
    const i1 = baseIndex + 1;
    const i2 = baseIndex + 2;
    const i3 = baseIndex + 3;
    if (flip) {
      indices.push(i0, i2, i1, i0, i3, i2);
    } else {
      indices.push(i0, i1, i2, i0, i2, i3);
    }
  };

  const addTrenchFace = (face: FaceSpec, overlapBlocks: BranchBlock[], invertWinding: boolean) => {
    const halfW = face.w * 0.5;
    const halfH = face.h * 0.5;
    const cellDepths = new Float32Array(seg * seg);
    const cellMask = new Uint8Array(seg * seg);
    const depthScale = maxDepth * depthGain;
    const insideEps = -1e-3;
    const depthEps = 1e-4;
    const useWrap = !globalWrapEnabled && wrapMode === "sides" && Math.abs(face.normal.y) < 0.5;
    const sampleMode: UvTransformMode = repeatWrapEnabled ? "repeat" : "clamp";
    const renderMode: UvTransformMode = repeatWrapEnabled ? "continuous" : "clamp";
    const projectFaceUv = (point: THREE.Vector3, mode: UvTransformMode, normalHint: THREE.Vector3 = face.normal) => {
      if (globalWrapEnabled) {
        return projectGlobalUv(point, normalHint, mode);
      }
      if (useWrap) {
        return sampleWrappedUv(point, widthMm, heightMm, depthMm, rotation, flipX, flipY, textureTiles, offsetX, offsetY, mode);
      }
      const dx = point.x - face.origin.x;
      const dy = point.y - face.origin.y;
      const dz = point.z - face.origin.z;
      const localU = dx * face.uDir.x + dy * face.uDir.y + dz * face.uDir.z;
      const localV = dx * face.vDir.x + dy * face.vDir.y + dz * face.vDir.z;
      const u = (localU + halfW) / face.w;
      const v = (halfH - localV) / face.h;
      return transformUv(u, v, rotation, flipX, flipY, textureTiles, offsetX, offsetY, mode);
    };

    for (let iy = 0; iy < seg; iy += 1) {
      for (let ix = 0; ix < seg; ix += 1) {
        const u = (ix + 0.5) / seg;
        const v = (iy + 0.5) / seg;
        const px = -halfW + u * face.w;
        const py = halfH - v * face.h;
        const cx = face.origin.x + face.uDir.x * px + face.vDir.x * py;
        const cy = face.origin.y + face.uDir.y * px + face.vDir.y * py;
        const cz = face.origin.z + face.uDir.z * px + face.vDir.z * py;
        let blocked = false;
        for (const block of overlapBlocks) {
          if (isPointInsideBlockCoords(cx, cy, cz, block, insideEps)) {
            blocked = true;
            break;
          }
        }
        if (blocked) continue;

        let depth = 0;
        if (map && depthScale > 0) {
          const edgeDist = Math.min(px + halfW, halfW - px, py + halfH, halfH - py);
          if (edgeDist > marginMm) {
            const pos = new THREE.Vector3(cx, cy, cz);
            const [uvU, uvV] = projectFaceUv(pos, sampleMode);
            const tone = sampleDetailHeight(map, uvU, uvV);
            const depthValue = mode === "emboss" ? tone : 1 - tone;
            depth = depthValue >= trenchThreshold ? depthScale : 0;
          }
        }
        cellMask[ix + iy * seg] = 1;
        cellDepths[ix + iy * seg] = depth;
      }
    }

    const getCorner = (u: number, v: number) => {
      const px = -halfW + u * face.w;
      const py = halfH - v * face.h;
      return new THREE.Vector3(
        face.origin.x + face.uDir.x * px + face.vDir.x * py,
        face.origin.y + face.uDir.y * px + face.vDir.y * py,
        face.origin.z + face.uDir.z * px + face.vDir.z * py
      );
    };

    for (let iy = 0; iy < seg; iy += 1) {
      for (let ix = 0; ix < seg; ix += 1) {
        const idx = ix + iy * seg;
        if (cellMask[idx] === 0) continue;
        const depth = cellDepths[idx];
        const offset = depth * sign;

        const u0 = ix / seg;
        const u1 = (ix + 1) / seg;
        const v0 = iy / seg;
        const v1 = (iy + 1) / seg;

        const base00 = getCorner(u0, v0);
        const base10 = getCorner(u1, v0);
        const base11 = getCorner(u1, v1);
        const base01 = getCorner(u0, v1);

        const v00 = base00.clone().addScaledVector(face.normal, offset);
        const v10 = base10.clone().addScaledVector(face.normal, offset);
        const v11 = base11.clone().addScaledVector(face.normal, offset);
        const v01 = base01.clone().addScaledVector(face.normal, offset);

        const uv00 = projectFaceUv(base00, renderMode);
        const uv10 = projectFaceUv(base10, renderMode);
        const uv11 = projectFaceUv(base11, renderMode);
        const uv01 = projectFaceUv(base01, renderMode);

        addQuadWithUvs(v00, v10, v11, v01, uv00, uv10, uv11, uv01, face.normal, invertWinding);

        if (depth <= depthEps) continue;

        const leftIdx = ix - 1 + iy * seg;
        const rightIdx = ix + 1 + iy * seg;
        const topIdx = ix + (iy - 1) * seg;
        const bottomIdx = ix + (iy + 1) * seg;

        const leftIncluded = ix > 0 && cellMask[leftIdx] === 1;
        const rightIncluded = ix < seg - 1 && cellMask[rightIdx] === 1;
        const topIncluded = iy > 0 && cellMask[topIdx] === 1;
        const bottomIncluded = iy < seg - 1 && cellMask[bottomIdx] === 1;

        const leftDepth = leftIncluded ? cellDepths[leftIdx] : 0;
        const rightDepth = rightIncluded ? cellDepths[rightIdx] : 0;
        const topDepth = topIncluded ? cellDepths[topIdx] : 0;
        const bottomDepth = bottomIncluded ? cellDepths[bottomIdx] : 0;

        const addWall = (p0: THREE.Vector3, p1: THREE.Vector3, neighborDepth: number, outwardDir: THREE.Vector3) => {
          if (depth <= neighborDepth + depthEps) return;
          const desiredNormal = invertWinding ? outwardDir.clone().multiplyScalar(-1) : outwardDir;
          const offA = depth * sign;
          const offB = neighborDepth * sign;
          const w0 = p0.clone().addScaledVector(face.normal, offA);
          const w1 = p1.clone().addScaledVector(face.normal, offA);
          const w2 = p1.clone().addScaledVector(face.normal, offB);
          const w3 = p0.clone().addScaledVector(face.normal, offB);
          const uv0 = projectFaceUv(w0, renderMode, outwardDir);
          const uv1 = projectFaceUv(w1, renderMode, outwardDir);
          const uv2 = projectFaceUv(w2, renderMode, outwardDir);
          const uv3 = projectFaceUv(w3, renderMode, outwardDir);
          addQuadWithUvs(w0, w1, w2, w3, uv0, uv1, uv2, uv3, desiredNormal, false);
        };

        if (ix === 0) {
          addWall(base00, base01, 0, face.uDir.clone().multiplyScalar(-1));
        } else if (leftIncluded) {
          addWall(base00, base01, leftDepth, face.uDir.clone().multiplyScalar(-1));
        }

        if (ix === seg - 1) {
          addWall(base10, base11, 0, face.uDir.clone());
        } else if (rightIncluded) {
          addWall(base10, base11, rightDepth, face.uDir.clone());
        }

        if (iy === 0) {
          addWall(base00, base10, 0, face.vDir.clone().multiplyScalar(-1));
        } else if (topIncluded) {
          addWall(base00, base10, topDepth, face.vDir.clone().multiplyScalar(-1));
        }

        if (iy === seg - 1) {
          addWall(base01, base11, 0, face.vDir.clone());
        } else if (bottomIncluded) {
          addWall(base01, base11, bottomDepth, face.vDir.clone());
        }
      }
    }
  };

  const addFace = (
    face: FaceSpec,
    applyEtch: boolean,
    invertWinding: boolean,
    overlapBlocks: BranchBlock[],
    normalOffset: number
  ) => {
    if (applyEtch && etchStyle === "trench") {
      addTrenchFace(face, overlapBlocks, invertWinding);
      return;
    }
    const baseIndex = positions.length / 3;
    const indexAt = (x: number, y: number) => baseIndex + x + y * (seg + 1);
    const halfW = face.w * 0.5;
    const halfH = face.h * 0.5;
    const shouldCull = overlapBlocks.length > 0;
    const insideEps = -1e-3;
    const useWrap = !globalWrapEnabled && wrapMode === "sides" && Math.abs(face.normal.y) < 0.5;
    const sampleMode: UvTransformMode = repeatWrapEnabled ? "repeat" : "clamp";
    const renderMode: UvTransformMode = repeatWrapEnabled ? "continuous" : "clamp";
    const hiddenMask = shouldCull ? new Uint8Array(seg * seg) : null;
    let visibleMinX = 0;
    let visibleMaxX = seg - 1;
    let visibleMinY = 0;
    let visibleMaxY = seg - 1;

    if (shouldCull) {
      if (fitToVisibleFace && !useWrap && !globalWrapEnabled) {
        visibleMinX = seg;
        visibleMaxX = -1;
        visibleMinY = seg;
        visibleMaxY = -1;
      }
      for (let iy = 0; iy < seg; iy += 1) {
        for (let ix = 0; ix < seg; ix += 1) {
          const u = (ix + 0.5) / seg;
          const v = (iy + 0.5) / seg;
          const px = -halfW + u * face.w;
          const py = halfH - v * face.h;
          const cx = face.origin.x + face.uDir.x * px + face.vDir.x * py;
          const cy = face.origin.y + face.uDir.y * px + face.vDir.y * py;
          const cz = face.origin.z + face.uDir.z * px + face.vDir.z * py;
          let hidden = false;
          for (const block of overlapBlocks) {
            if (isPointInsideBlockCoords(cx, cy, cz, block, insideEps)) {
              hidden = true;
              break;
            }
          }
          if (hidden) {
            hiddenMask![ix + iy * seg] = 1;
            continue;
          }
          if (fitToVisibleFace && !useWrap && !globalWrapEnabled) {
            visibleMinX = Math.min(visibleMinX, ix);
            visibleMaxX = Math.max(visibleMaxX, ix);
            visibleMinY = Math.min(visibleMinY, iy);
            visibleMaxY = Math.max(visibleMaxY, iy);
          }
        }
      }
      if (fitToVisibleFace && !useWrap && !globalWrapEnabled && visibleMaxX < visibleMinX) {
        visibleMinX = 0;
        visibleMaxX = seg - 1;
        visibleMinY = 0;
        visibleMaxY = seg - 1;
      }
    }

    const visibleU0 = fitToVisibleFace && !useWrap && !globalWrapEnabled ? visibleMinX / seg : 0;
    const visibleU1 = fitToVisibleFace && !useWrap && !globalWrapEnabled ? (visibleMaxX + 1) / seg : 1;
    const visibleV0 = fitToVisibleFace && !useWrap && !globalWrapEnabled ? visibleMinY / seg : 0;
    const visibleV1 = fitToVisibleFace && !useWrap && !globalWrapEnabled ? (visibleMaxY + 1) / seg : 1;
    const visibleSpanU = Math.max(1e-6, visibleU1 - visibleU0);
    const visibleSpanV = Math.max(1e-6, visibleV1 - visibleV0);
    const projectUv = (u: number, v: number, pos: THREE.Vector3, mode: UvTransformMode) => {
      if (globalWrapEnabled) {
        return projectGlobalUv(pos, face.normal, mode);
      }
      if (useWrap) {
        return sampleWrappedUv(pos, widthMm, heightMm, depthMm, rotation, flipX, flipY, textureTiles, offsetX, offsetY, mode);
      }
      const uFace = fitToVisibleFace ? clamp01((u - visibleU0) / visibleSpanU) : u;
      const vFace = fitToVisibleFace ? clamp01((v - visibleV0) / visibleSpanV) : v;
      return transformUv(uFace, vFace, rotation, flipX, flipY, textureTiles, offsetX, offsetY, mode);
    };

    for (let iy = 0; iy <= seg; iy += 1) {
      const v = iy / seg;
      for (let ix = 0; ix <= seg; ix += 1) {
        const u = ix / seg;
        const px = -halfW + u * face.w;
        const py = halfH - v * face.h;
        const pos = new THREE.Vector3().addScaledVector(face.uDir, px).addScaledVector(face.vDir, py).add(face.origin);
        const [sampleU, sampleV] = projectUv(u, v, pos, sampleMode);
        const [uvU, uvV] = projectUv(u, v, pos, renderMode);

        let depth = 0;
        if (applyEtch && map && maxDepth > 0) {
          const edgeDist = Math.min(px + halfW, halfW - px, py + halfH, halfH - py);
          if (edgeDist > marginMm) {
            const fade = clamp01((edgeDist - marginMm) / softMargin);
            const tone = sampleDetailHeight(map, sampleU, sampleV);
            const depthValue = mode === "emboss" ? tone : 1 - tone;
            const posterized = Number(ui.depthPosterize.value) > 0;
            const hardPower = posterized ? 1.0 : 1.25;
            depth = Math.pow(clamp01(depthValue), hardPower) * maxDepth * depthGain * fade;
          }
        }
        const displaced = pos.clone().addScaledVector(face.normal, depth * sign + normalOffset);
        positions.push(displaced.x, displaced.y, displaced.z);
        uvs.push(uvU, uvV);
      }
    }

    for (let iy = 0; iy < seg; iy += 1) {
      for (let ix = 0; ix < seg; ix += 1) {
        if (shouldCull && hiddenMask![ix + iy * seg] === 1) continue;
        const i0 = indexAt(ix, iy);
        const i1 = indexAt(ix + 1, iy);
        const i2 = indexAt(ix + 1, iy + 1);
        const i3 = indexAt(ix, iy + 1);
        if (invertWinding) {
          indices.push(i0, i1, i2, i0, i2, i3);
        } else {
          indices.push(i0, i2, i1, i0, i3, i2);
        }
      }
    }
  };

  const addFacesFromBlocks = (
    blockSet: BranchBlock[],
    applyEtchFn: (face: FaceSpec) => boolean,
    invertWinding: boolean,
    normalOffset: number
  ) => {
    for (let i = 0; i < blockSet.length; i += 1) {
      const faces = buildFaceSpecs(blockSet[i], i);
      for (const face of faces) {
        if (isFaceInternal(face, blockSet)) continue;
        const overlapBlocks = getOverlapBlocks(face, blockSet);
        addFace(face, applyEtchFn(face), invertWinding, overlapBlocks, normalOffset);
      }
    }
  };

  const applyOuterEtch = (face: FaceSpec) => allFaces || (face.blockIndex === 0 && face.faceId === 0);

  addFacesFromBlocks(blocks, applyOuterEtch, false, 0);


  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

const showGeometry = (geometry: THREE.BufferGeometry) => {
  // Dispose previous mesh geometries before replacing them to avoid GPU memory leaks.
  for (const child of group.children) {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry && typeof mesh.geometry.dispose === "function") {
      mesh.geometry.dispose();
    }
  }
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

const applySurfaceDetail = () => {
  const geometry = buildEtchedBlockGeometry(getActiveDetailMap());
  currentGeometry = geometry;
  showGeometry(geometry);
  const { shape, widthMm, heightMm, depthMm } = getShapeDimensions();
  const { maxDepth } = getCarveSettings();
  const label = getDetailMode() === "emboss" ? "Emboss" : "Carve";
  const attachmentCount = shape === "rect" && rectKitbash ? rectKitbash.length : 0;
  const sizeLabel =
    shape === "cube"
      ? `${Math.round(widthMm)} mm cube`
      : `${Math.round(widthMm)}x${Math.round(heightMm)}x${Math.round(depthMm)} mm rectangle${attachmentCount ? ` + ${attachmentCount} blocks` : ""}`;
  if (getActiveDetailMap() && maxDepth > 0) {
    setStatus(`Ready. Etch ${sizeLabel}. ${label} ${maxDepth.toFixed(1)} mm.`);
  } else {
    setStatus(`Ready. Etch ${sizeLabel}. Load an image to carve.`);
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
      const shape = getShapeMode();
      if (shape === "rect") {
        if (forceBranchRandomize || !rectKitbash) rectKitbash = makeRectKitbash(getShellSettings().wallThicknessMm);
      } else {
        rectKitbash = null;
      }
      forceBranchRandomize = false;
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
  return `solid etched_block\n${triangles.join("\n")}\nendsolid etched_block\n`;
};

const geometryToBinaryStl = (geometry: THREE.BufferGeometry) => {
  const index = geometry.getIndex();
  const positions = geometry.getAttribute("position");
  if (!positions) return null;
  const triangleCount = index ? Math.floor(index.count / 3) : Math.floor(positions.count / 3);
  const buffer = new ArrayBuffer(84 + triangleCount * 50);
  const view = new DataView(buffer);
  view.setUint32(80, triangleCount, true);

  const getVertex = (triIndex: number, vertOffset: number) => {
    const vertexIndex = index ? index.getX(triIndex * 3 + vertOffset) : triIndex * 3 + vertOffset;
    return [
      positions.getX(vertexIndex),
      positions.getY(vertexIndex),
      positions.getZ(vertexIndex),
    ];
  };

  let offset = 84;
  for (let tri = 0; tri < triangleCount; tri += 1) {
    const a = getVertex(tri, 0);
    const b = getVertex(tri, 1);
    const c = getVertex(tri, 2);
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
    const nnx = nx / len;
    const nny = ny / len;
    const nnz = nz / len;

    view.setFloat32(offset, nnx, true);
    view.setFloat32(offset + 4, nny, true);
    view.setFloat32(offset + 8, nnz, true);
    view.setFloat32(offset + 12, a[0], true);
    view.setFloat32(offset + 16, a[1], true);
    view.setFloat32(offset + 20, a[2], true);
    view.setFloat32(offset + 24, b[0], true);
    view.setFloat32(offset + 28, b[1], true);
    view.setFloat32(offset + 32, b[2], true);
    view.setFloat32(offset + 36, c[0], true);
    view.setFloat32(offset + 40, c[1], true);
    view.setFloat32(offset + 44, c[2], true);
    view.setUint16(offset + 48, 0, true);
    offset += 50;
  }
  return buffer;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const exportStl = async () => {
  if (!currentGeometry) {
    setStatus("Nothing to export. Generate first.");
    return;
  }
  setBusy(true);
  setStatus("Exporting STL...");
  await new Promise((resolve) => setTimeout(resolve, 30));
  const binary = geometryToBinaryStl(currentGeometry);
  if (!binary) {
    setBusy(false);
    setStatus("STL export failed. Try regenerating.");
    return;
  }
  try {
    if (window.api?.saveFile) {
      const base64 = arrayBufferToBase64(binary);
      const result = await window.api.saveFile({
        data: base64,
        encoding: "base64",
        suggestedName: "etched_block.stl",
        filters: [{ name: "STL", extensions: ["stl"] }],
      });
      if (!result?.ok) {
        throw new Error("Save canceled or failed.");
      }
      setStatus("STL exported.");
      setBusy(false);
      return;
    }
  } catch (error) {
    console.error(error);
    setStatus("STL export failed via desktop save dialog. Downloading instead.");
  }
  const blob = new Blob([binary], { type: "model/stl" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "etched_block.stl";
  a.click();
  URL.revokeObjectURL(url);
  setStatus("STL exported.");
  setBusy(false);
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
    if (ui.depthLive.checked) scheduleGenerate();
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

ui.generate.addEventListener("click", () => {
  forceBranchRandomize = true;
  generate();
});
ui.texture.addEventListener("click", () => ui.textureInput.click());
ui.export.addEventListener("click", exportStl);
ui.shapeMode.addEventListener("change", () => {
  forceBranchRandomize = true;
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
ui.etchSize.addEventListener("input", () => {
  updateControlLabels();
  scheduleGenerate();
});
ui.rectWidth.addEventListener("input", () => {
  forceBranchRandomize = true;
  updateControlLabels();
  scheduleGenerate();
});
ui.rectHeight.addEventListener("input", () => {
  forceBranchRandomize = true;
  updateControlLabels();
  scheduleGenerate();
});
ui.rectDepth.addEventListener("input", () => {
  forceBranchRandomize = true;
  updateControlLabels();
  scheduleGenerate();
});
ui.wallThickness.addEventListener("input", () => {
  forceBranchRandomize = true;
  updateControlLabels();
  scheduleGenerate();
});
ui.etchGain.addEventListener("input", () => {
  updateControlLabels();
  scheduleDetailUpdate();
});
ui.etchStyle.addEventListener("change", () => {
  updateModeUI();
  updateControlLabels();
  scheduleDetailUpdate();
  scheduleGenerate();
});
ui.trenchThreshold.addEventListener("input", () => {
  updateControlLabels();
  scheduleDetailUpdate();
});
ui.trenchThreshold.addEventListener("change", () => {
  scheduleGenerate();
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
  updateModeUI();
  scheduleDetailUpdate();
  scheduleGenerate();
});
ui.etchFitFace.addEventListener("change", () => {
  scheduleDetailUpdate();
  scheduleGenerate();
});
ui.textureRepeat.addEventListener("change", () => {
  updateModeUI();
  updateControlLabels();
  syncTextureWrapModes();
  scheduleDetailUpdate();
  scheduleGenerate();
});
ui.textureTiles.addEventListener("input", () => {
  updateControlLabels();
  syncTextureWrapModes();
  scheduleDetailUpdate();
  scheduleGenerate();
});
ui.etchRotation.addEventListener("change", () => {
  updateControlLabels();
  scheduleDetailUpdate();
});
ui.etchOffsetX.addEventListener("input", () => {
  updateControlLabels();
  scheduleDetailUpdate();
});
ui.etchOffsetY.addEventListener("input", () => {
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
  if (ui.depthLive.checked) scheduleGenerate();
});
ui.depthPreview.addEventListener("change", () => {
  updateMaterialPreview();
});
ui.depthStudioMode.addEventListener("change", () => {
  updateDepthStudioPreview();
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
