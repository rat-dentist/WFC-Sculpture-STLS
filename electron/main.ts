import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { dirname, join } from "path";
import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#0e0e0c",
    show: false,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(join(__dirname, "../ui-dist/index.html"));
  }
};

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("save-file", async (_event, payload: { data: string; encoding: "utf8" | "base64"; suggestedName: string; filters?: { name: string; extensions: string[] }[] }) => {
  const result = await dialog.showSaveDialog({
    defaultPath: payload.suggestedName,
    filters: payload.filters,
  });
  if (result.canceled || !result.filePath) return { ok: false };
  if (payload.encoding === "base64") {
    const buffer = Buffer.from(payload.data, "base64");
    await writeFile(result.filePath, buffer);
  } else {
    await writeFile(result.filePath, payload.data, "utf8");
  }
  return { ok: true, path: result.filePath };
});
