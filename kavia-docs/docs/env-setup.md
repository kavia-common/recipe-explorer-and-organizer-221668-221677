# Frontend Environment Setup

## Overview

The Recipe App frontend is a Create React App (CRA) project. It reads configuration from environment variables prefixed with `REACT_APP_`. These variables are compiled into the bundle at build time and control how the app connects to the backend and behaves in different environments.

By default, development previews run on port 3000. You can start the app using `npm start` and access it at:
- http://localhost:3000

The API base URL should point to the backend service. The app resolves the backend base URL in this priority:
1) `REACT_APP_API_BASE`
2) `REACT_APP_BACKEND_URL`

Trailing slashes are removed automatically.

## Quick Start

1. Copy `.env.example` to `.env` in the `recipe_frontend` directory.
2. Set `REACT_APP_API_BASE` (or `REACT_APP_BACKEND_URL`) to your backend origin, for example:
   - `http://localhost:8080`
   - `https://api.my-recipes.example.com`
3. Start the frontend:
   - `npm start` (serves the app at http://localhost:3000)

## Required Variables

The following variables should be set for typical development:

- `REACT_APP_API_BASE`  
  The preferred base URL for the backend REST API that the frontend calls. Example: `http://localhost:8080`. If omitted, the app falls back to `REACT_APP_BACKEND_URL`.

- `REACT_APP_PORT`  
  Port for local development server (CRA default is 3000). Typically this is set in the shell as `PORT`, but we expose `REACT_APP_PORT` to document intended defaults across environments. When using CRA, the actual dev server port is controlled by the `PORT` environment variable. Keep in mind the hosted preview also uses port 3000.

- `REACT_APP_LOG_LEVEL`  
  String level for client-side logging (e.g., `debug`, `info`, `warn`, `error`). Used to control verbosity in development and production builds.

- `REACT_APP_FEATURE_FLAGS`  
  Comma-separated list or JSON-like string of feature flags to toggle experimental UI or flows on/off in the client.

## Optional Variables

These variables are recognized in the repository or for future compatibility, but are optional. Set them if your deployment needs them.

- `REACT_APP_BACKEND_URL`  
  Fallback base URL for the API if `REACT_APP_API_BASE` is not set.

- `REACT_APP_FRONTEND_URL`  
  Public origin of the frontend (useful when generating absolute links or in cross-origin flows).

- `REACT_APP_WS_URL`  
  WebSocket base URL if the app integrates with a websocket server (e.g., `ws://localhost:8080` or `wss://...`).

- `REACT_APP_NODE_ENV`  
  String to mirror runtime environment. CRA exposes `process.env.NODE_ENV` automatically, but this can be used to gate custom client behavior.

- `REACT_APP_NEXT_TELEMETRY_DISABLED`  
  Included for consistency across environments where telemetry needs to be disabled; not used directly by CRA, but documented for parity.

- `REACT_APP_ENABLE_SOURCE_MAPS`  
  Toggle source maps in production builds if you need to adjust CRA behavior in CI/CD environments.

- `REACT_APP_TRUST_PROXY`  
  Used in certain proxying deployments; not required for local development.

- `REACT_APP_HEALTHCHECK_PATH`  
  Path that hosting environments may ping to verify health. The frontend does not expose a server route, but some platforms read this variable for health probes.

- `REACT_APP_EXPERIMENTS_ENABLED`  
  A general switch for enabling experiments. Can be used alongside `REACT_APP_FEATURE_FLAGS`.

## How the Frontend Reads the API Base URL

- In `src/api/client.js`, an Axios client is created with a `baseURL` resolved from environment variables:
  - Priority: `REACT_APP_API_BASE`, then `REACT_APP_BACKEND_URL`.
  - Trailing slashes are removed.
- In `src/App.js`, `getApiBaseUrl()` uses the same resolution priority and logs the resolved value in non-production builds.

Example:
```javascript
// src/api/client.js
const baseURL =
  (process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');
```

## Local Development Notes

- Preview runs on port 3000: `npm start` serves at http://localhost:3000.
- Backend typically runs on a different port (for example, 8080). Set `REACT_APP_API_BASE=http://localhost:8080` in `.env` so the frontend can reach the backend.
- If you need to change the dev server port for CRA, set the shell variable `PORT=3001` when running `npm start`. The `REACT_APP_PORT` key documents intended defaults and can be used by tooling, but CRA respects `PORT`.

## Example .env

Place this file at `recipe_frontend/.env` (do not commit it):

```
# Required
REACT_APP_API_BASE=http://localhost:8080
REACT_APP_PORT=3000
REACT_APP_LOG_LEVEL=info
REACT_APP_FEATURE_FLAGS=

# Optional
REACT_APP_BACKEND_URL=
REACT_APP_FRONTEND_URL=
REACT_APP_WS_URL=
REACT_APP_NODE_ENV=development
REACT_APP_NEXT_TELEMETRY_DISABLED=1
REACT_APP_ENABLE_SOURCE_MAPS=true
REACT_APP_TRUST_PROXY=false
REACT_APP_HEALTHCHECK_PATH=/healthz
REACT_APP_EXPERIMENTS_ENABLED=false
```

## Troubleshooting

- If API calls fail with network errors, confirm `REACT_APP_API_BASE` or `REACT_APP_BACKEND_URL` points to a reachable backend and has the correct scheme (`http` vs `https`) and port.
- If you see CORS issues, ensure the backend allows the frontend origin (http://localhost:3000 in development) and that credentials/cookies are permitted if needed (`withCredentials: true` is enabled in the Axios client).
- For production builds, remember environment variables are compiled at build time. Rebuild when changing `.env` values.
