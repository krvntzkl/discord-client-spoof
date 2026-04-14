# Client Spoof (Moonlight)

A [moonlight](https://moonlight-mod.github.io/) extension that tweaks **client properties** (super properties) so another client type (desktop, mobile, web, etc.) appears, while keeping the real `client_build_number` values.

## Quick install

For users who only want to enable the plugin **without cloning or building**:

1. Open [**Releases**](https://github.com/krvntzkl/discord-client-spoof/releases) and download the latest **`moonlight-dist-vX.Y.Z.zip`** (an archive of the prebuilt `dist/` folder).
2. Extract it wherever you like, for example  
   `C:\Extensions\discord-client-spoof-dist`  
   You should get a folder that **contains** `client_spoofer\` (with `manifest.json` inside).
3. In **Moonbase** → extension search paths (*Extension search paths*), add **that folder** (the one that contains `client_spoofer`), **not** the zip file and not a random subfolder.
4. Restart Discord if needed, then enable **Client Spoof** in Moonbase.

> Same rule as the [official docs](https://moonlight-mod.github.io/ext-dev/getting-started/#build-and-run-your-extension): the path must point to the equivalent of the **`dist`** folder — a directory whose subfolders are the built extensions (`client_spoofer`, etc.).

---

## Developers: build from source

### Requirements

- **Node.js 22** or newer ([moonlight extensions](https://moonlight-mod.github.io/ext-dev/getting-started/))
- **pnpm** (this repo uses `pnpm-lock.yaml`)
- Discord + moonlight + Moonbase

### Steps

1. Clone and install:

   ```bash
   git clone https://github.com/krvntzkl/discord-client-spoof.git
   cd discord-client-spoof
   pnpm install
   ```

2. Build:

   ```bash
   pnpm run build
   ```

3. In Moonbase, add **only** the repo’s **`dist`** folder to the search paths (e.g. `...\discord-client-spoof\dist`).

4. Restart / reload and enable **Client Spoof** (`clientSpoof`).

### Development

```bash
pnpm run dev
```

Then **Ctrl+R** in Discord after each rebuild.

```bash
pnpm run check
```

---

## Moonlight documentation

- [Getting started (extensions)](https://moonlight-mod.github.io/ext-dev/getting-started/)
- [Extension manifests](https://moonlight-mod.github.io/ext-dev/manifest/)
