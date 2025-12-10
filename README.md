**Project**: Flutter_Builder(Frontend)

This repository contains the frontend for the Flutter Builder app (Vite + React). It uses `pnpm` and expects a separate backend API (Django or similar) for full functionality.

**Quick Start (Windows PowerShell)**

- **Install Node & pnpm (recommended via Corepack)**:

```powershell
# Install Node.js (LTS 18 or 20) from https://nodejs.org/
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm -v
node -v
```

- **Install dependencies** (run from the project root):

```powershell
cd 'e:\The-Final-Project\Front-End'
pnpm install
```

- **Clone the repository** (run from the project root):

```powershell
git clone https://github.com/KhaledAbdurahman/Flutter_Builder-Frontend-.git
cd Flutter_Builder-Frontend
```

The Vite dev server serves the app from the `client` folder (configured in `vite.config.ts`) and enables HMR.

**Build & Run Production**

- **Build** (client assets + bundle server):

```powershell
pnpm build
```

- **Run bundled Express server** (PowerShell):

```powershell
$env:NODE_ENV = 'production'
node dist/index.js
```

The build outputs static assets to `dist/public` and bundles the small Express server into `dist/index.js`. The server serves the static files and falls back to `index.html` for client-side routing.

**Preview Production Build (without Express)**

```powershell
pnpm preview
```

**Environment variables (Vite / runtime)**

- Place env files at project root (Vite `envDir` is the repository root).
- Common variables:
  - `VITE_API_URL` — API base URL used by the frontend (default `http://localhost:8000/api`).
  - `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID` — used to build login URL in `client/src/const.ts`.
  - `PORT` — server port (Express uses `PORT` or defaults to `3000`).

**Important Notes & Tips**

- Use `pnpm` (not `npm`/`yarn`) because this repo uses `pnpm.patchedDependencies` and a `patches/` directory that `pnpm` will apply.
- If saving/loading/generation features are required, run the backend API at `VITE_API_URL` (see `client/src/lib/api.ts`).
- The `start` script in `package.json` uses Unix-style env syntax; on Windows use the PowerShell `$env:` form above.
- Recommended Node: LTS (18 or 20). If you run into build issues, check `esbuild`/`node` compatibility.

**Where to look next**

- Client entry: `client/src/main.tsx` → `client/src/App.tsx` (routes and providers).
- Vite config: `vite.config.ts` (`root: client`, `outDir: dist/public`, aliases `@` and `@shared`).
- Server entry: `server/index.ts` (bundled by build step to `dist/index.js`).

---

File location: `e:\The-Final-Project\Front-End\README.md`

If you want, I can also:

- commit this change and run `pnpm install` in the workspace and report any issues,
- or update the `start` script to be cross-platform (add `cross-env`),
  which would you prefer?
