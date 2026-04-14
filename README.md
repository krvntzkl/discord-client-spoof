# Client Spoof (Moonlight)

Extension [moonlight](https://moonlight-mod.github.io/) qui modifie les **client properties** (super properties) pour faire apparaître un autre type de client (desktop, mobile, web, etc.) tout en conservant les `client_build_number` réels.

## Installation rapide

Pour les utilisateurs qui veulent seulement activer le plugin **sans cloner ni compiler** :

1. Va sur [**Releases**](https://github.com/krvntzkl/discord-client-spoof/releases) et télécharge la dernière **`moonlight-dist-vX.Y.Z.zip`** (archive du dossier `dist/` déjà buildé).
2. Décompresse-la où tu veux, par exemple  
   `C:\Extensions\discord-client-spoof-dist`  
   Tu dois obtenir un dossier qui **contient** `client_spoofer\` (avec `manifest.json` dedans).
3. Dans **Moonbase** → chemins de recherche d’extensions (*Extension search paths*), ajoute **ce dossier-là** (celui qui contient `client_spoofer`), **pas** le zip et pas un sous-dossier au hasard.
4. Redémarre Discord si besoin, puis active **Client Spoof** dans Moonbase.

> Même règle qu’en [doc officielle](https://moonlight-mod.github.io/ext-dev/getting-started/#build-and-run-your-extension) : le chemin doit pointer vers l’équivalent du dossier **`dist`** — un répertoire dont les sous-dossiers sont les extensions compilées (`client_spoofer`, etc.).

---

## Développeurs : build depuis les sources

### Prérequis

- **Node.js 22** ou plus récent ([extensions moonlight](https://moonlight-mod.github.io/ext-dev/getting-started/))
- **npm** (ce dépôt utilise `package-lock.json`)
- Discord + moonlight + Moonbase

### Étapes

1. Clone et installe :

   ```bash
   git clone https://github.com/krvntzkl/discord-client-spoof.git
   cd discord-client-spoof
   npm install
   ```

2. Compile :

   ```bash
   npm run build
   ```

3. Dans Moonbase, ajoute **uniquement** le dossier **`dist`** du dépôt aux chemins de recherche (ex. `...\discord-client-spoof\dist`).

4. Redémarre / recharge et active **Client Spoof** (`clientSpoof`).

### Développement

```bash
npm run dev
```

Puis **Ctrl+R** dans Discord après chaque rebuild.

```bash
npm run check
```

---

## Publier une release (mainteneur)

**Automatique (recommandé)** : crée un tag versionné et pousse-le ; le workflow [`.github/workflows/release.yml`](.github/workflows/release.yml) lance le build et attache **`moonlight-dist-vX.Y.Z.zip`** à la release GitHub.

```bash
git tag v1.2.0
git push origin v1.2.0
```

Sur GitHub : *Releases* → la release créée contient l’archive pour les utilisateurs.

**À la main** : `npm run build`, puis compresse **le contenu** du dossier `dist/` (tu dois avoir `client_spoofer\` à la racine de l’archive), et ajoute ce fichier zip à une release.

---

## Structure du dépôt

| Dossier / fichier | Rôle |
|-------------------|------|
| `plugins/client_spoofer/` | Sources de l’extension |
| `dist/` | Sortie du build — c’est l’équivalent de ce qui est dans le zip de release |

## Documentation moonlight

- [Getting started (extensions)](https://moonlight-mod.github.io/ext-dev/getting-started/)
- [Manifestes d’extension](https://moonlight-mod.github.io/ext-dev/manifest/)
