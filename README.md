# Sift Dashboard

React UI for Project Sift: upload binary payloads, watch batches complete, browse the JSON keys extracted from each
payload. The backend lives in a separate project (Spring Boot, `https://github.com/supngo/sift-be`).

## Requirements
1. Node 24
2. Any browser
3. 
## AI Helps
This application is aided by `Claude code`.
1. Built all the apis
2. Built all the components
3. Built all the pages

## Run it

1. Start the backend (from the backend folder): `docker compose up --build`. It serves the API on http://localhost:8080.
2. Start the UI:

   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:5173. The header badge shows whether the backend is reachable.

Point the UI at another backend with `VITE_API_BASE_URL` in `.env.local` (see `.env.example`). That backend must
allow the UI's origin in `SIFT_CORS_ALLOWED_ORIGINS`.

## What it does

- **Upload:** drop one or more files. One file is sent as raw bytes (`application/octet-stream`). Several are packed
  into the batch envelope in the browser (`application/x-sift-batch`), and the backend stores one payload per file, in order.
- **Recent batches:** status, payload counts and a progress bar (green done, red failed). Refreshes every 1.5 s while
  something is busy.
- **Batch page:** per payload, its status while busy (waiting for a worker / extracting / retrying), then its keys,
  each JSON document with key paths and depth, extractor warnings, and errors.

## Scripts

| Script | |
|---|---|
| `npm run dev` | Dev server on port 5173 (fixed: the backend's CORS allows that origin) |
| `npm run build` | Type check and production build into `dist/` |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | Oxlint |
| `npm run api:update` | With the backend running: refresh `openapi.json` and regenerate the typed API (`src/api/schema.d.ts`) |
