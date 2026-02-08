import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  saveFile: (payload: { data: string; encoding: "utf8" | "base64"; suggestedName: string; filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke("save-file", payload),
});
