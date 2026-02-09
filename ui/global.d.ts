export {};

declare global {
  interface Window {
    api?: {
      saveFile: (payload: {
        data: string;
        encoding: "utf8" | "base64";
        suggestedName: string;
        filters?: { name: string; extensions: string[] }[];
      }) => Promise<{ ok: boolean; path?: string }>;
    };
  }
}
