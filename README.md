# Client Spoof (Moonlight)

A [moonlight](https://moonlight-mod.github.io/) extension that tweaks **client properties** (super properties) so another client type (desktop, mobile, web, etc.) appears, while keeping the real `client_build_number` values.

## Quick install (no build tools)

1. Open [**Releases**](https://github.com/krvntzkl/discord-client-spoof/releases) and download the latest **`moonlight-dist-vX.Y.Z.zip`** (prebuilt `dist/` layout), or use **`clientSpoof.asar`** if you install `.asar` bundles via Moonbase.
2. **Zip:** extract anywhere, e.g. `C:\Extensions\discord-client-spoof-dist`. You should see a folder **`client_spoofer\`** with `manifest.json` inside.
3. In **Moonbase** → **Extension search paths**, add the folder that **contains** `client_spoofer` (not the `.zip` itself).
4. Restart Discord if needed, then enable **Client Spoof** in Moonbase.

> Same rule as the [official docs](https://moonlight-mod.github.io/ext-dev/getting-started/#build-and-run-your-extension): the path must be the equivalent of a **`dist`** folder — one directory whose subfolders are built extensions.

---

## Developers: build from source

### Requirements

- **Node.js 22+** and **pnpm 10+** ([moonlight extension docs](https://moonlight-mod.github.io/ext-dev/getting-started/))
- Discord + moonlight + Moonbase

### Commands

```bash
git clone https://github.com/krvntzkl/discord-client-spoof.git
cd discord-client-spoof
pnpm install
pnpm run build
```

Add **only** the repo’s **`dist`** directory to Moonbase extension search paths (e.g. `...\discord-client-spoof\dist`), then reload and enable **Client Spoof** (`clientSpoof`).

### Pack `.asar` (official index / CI)

The official extension index expects a **build** plus a **`repo`** step that produces `repo/<extensionId>.asar`:

```bash
pnpm run build
pnpm run repo
# output: repo/clientSpoof.asar
```

### Development

```bash
pnpm run dev
```

Reload Discord (**Ctrl+R**) after each rebuild.

```bash
pnpm run check
```

---

## Submitting to the [official moonlight extensions repository](https://moonlight-mod.github.io/ext-dev/official-repository/)

Prerequisites on your side:

- This repo uses **pnpm** and exposes **`build`** + **`repo`** scripts; the artifact for the index is **`repo/clientSpoof.asar`** (see [`exts/clearUrls.json`](https://github.com/moonlight-mod/extensions/blob/main/exts/clearUrls.json) for the same pattern).
- Bump **`version`** in `plugins/client_spoofer/manifest.json` when you change the extension.
- Ensure **`meta.source`** points to this Git repository (HTTPS).

Steps:

1. **Fork** [`moonlight-mod/extensions`](https://github.com/moonlight-mod/extensions).
2. In your fork, add **`exts/clientSpoof.json`** (filename = extension id):

   ```json
   {
     "repository": "https://github.com/krvntzkl/discord-client-spoof.git",
     "commit": "FULL_SHA_OF_THE_COMMIT_TO_PUBLISH",
     "scripts": ["build", "repo"],
     "artifact": "repo/clientSpoof.asar"
   }
   ```

3. Get the **full commit SHA** from GitHub (commit page → copy).
4. Open a **pull request** to `moonlight-mod/extensions`. After merge, the extension can be installed from Moonbase via the official list.
5. For **updates**: bump `version` in the extension manifest, push, then open a new PR that only updates the **`commit`** (and any metadata if needed).

---

## Troubleshooting & logs

1. **DevTools (main place for extension `logger` output)**  
   - Enable if needed in Discord’s `settings.json`:  
     `"DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING": true`  
     ([Discord config folder](https://moonlight-mod.github.io/using/crash-recovery#finding-discords-logs) — e.g. `%AppData%\discord` on Windows; name varies by branch: `discordptb`, etc.)  
   - Restart Discord, then **Ctrl+Shift+I** → **Console**.  
   - **Important:** moonlight’s `getLogger()` messages may **not** contain the substring `clientSpoof`, so a strict console filter can hide everything. Clear the filter or search for **`[clientSpoof]`** — this extension also uses `console.info("[clientSpoof]", …)` so those lines match.  
   - Set log level to **Verbose** / **All levels** if needed.  
   - After reload you should see at least: `[clientSpoof] hooks installed`, and if the gateway patch runs: `[clientSpoof] afterIdentify called` / `Gateway IDENTIFY OK`.

2. **Log files on disk**  
   Same config folder → `logs\` → especially **`renderer_js.log`** (see [crash recovery / logs](https://moonlight-mod.github.io/using/crash-recovery/)).

If you **never** see `[clientSpoof] afterIdentify` after connecting, the webpack patch on `handleIdentify()` likely does not match the current Discord build — the extension needs an updated patch.

3. **pnpm 10 + esbuild**  
   This repo sets `"pnpm": { "onlyBuiltDependencies": ["esbuild"] }` so pnpm runs esbuild’s `postinstall` (native binary). If you ever see *“Ignored build scripts: esbuild”*, run `pnpm install` again (or `pnpm rebuild esbuild`) after pulling — otherwise builds can be unreliable.

---

## Moonlight documentation

- [Getting started (extensions)](https://moonlight-mod.github.io/ext-dev/getting-started/)
- [Using DevTools](https://moonlight-mod.github.io/ext-dev/devtools/)
- [Submitting to the official repository](https://moonlight-mod.github.io/ext-dev/official-repository/)
- [Extension manifests](https://moonlight-mod.github.io/ext-dev/manifest/)
