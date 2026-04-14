import type { ExtensionWebExports } from "@moonlight-mod/types";

/**
 * Patch du résultat de `handleIdentify()` — même idée que la PR Vencord « DeviceSpoof » :
 * le client envoie l’IDENTIFY (y compris fast connect) sans forcément passer par
 * `WebSocket.send` en JSON brut interceptable.
 */
export const patches: ExtensionWebExports["patches"] = [
  {
    find: "this.handleIdentify()",
    replace: {
      match:
        /(?:let|const|var)\s+(\i)\s*=\s*(?:await\s+)?this\.handleIdentify\(\)/g,
      replacement: (full: string, varName: string) =>
        `${full};require("clientSpoof_spoof").afterIdentify(${varName});`,
    },
  },
];

export const webpackModules: ExtensionWebExports["webpackModules"] = {
  spoof: {
    entrypoint: true,
  },
};
