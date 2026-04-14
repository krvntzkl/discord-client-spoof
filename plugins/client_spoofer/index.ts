import type { ExtensionWebExports } from "@moonlight-mod/types";

/**
 * Patch the return value of `handleIdentify()` (same idea as Vencord’s DeviceSpoof PR):
 * IDENTIFY (including fast connect) may not go through raw `WebSocket.send` JSON.
 */
export const patches: ExtensionWebExports["patches"] = [
  {
    find: "this.handleIdentify()",
    replace: {
      // No /g flag: multiple replacements in the same module can break handleIdentify /
      // fast connect and cause the “connection issues” screen.
      match:
        /(?:let|const|var)\s+(\i)\s*=\s*(?:await\s+)?this\.handleIdentify\(\)/,
      replacement: (full: string, varName: string) =>
        `${full};try{require("clientSpoof_spoof").afterIdentify(${varName});}catch(_){}`,
    },
  },
];

/**
 * Omit `run`: Moonlight’s loader (`core/extension/loader.ts`) then injects the compiled
 * `webpackModules/spoof.js` as the webpack factory. With `run: () => {}`, that empty stub
 * replaces the whole module — no hooks, no `[clientSpoof]` logs.
 */
export const webpackModules = {
  spoof: {
    entrypoint: true,
  },
} as unknown as ExtensionWebExports["webpackModules"];
