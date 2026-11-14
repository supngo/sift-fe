# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React dashboard for **Project Sift**: an operator uploads binary payloads, watches each batch go from `busy` to `completed`, and browses the JSON keys the backend extracted. React 19 + TypeScript 7 + Vite 8, Mantine 9 (UI), TanStack Query 5 (data/polling), React Router 8, openapi-fetch (typed client).

The backend is a separate project (Spring Boot 4 / Java 21 / Postgres). Its own `CLAUDE.md` and `README.md` describe it in depth. To read or change backend code from a session here, start Claude Code with `claude --add-dir C:\Users\supng\Downloads\sift-step1`.

## Commands

```bash
npm run dev          # http://localhost:5173 (strictPort: the backend's CORS allows exactly this origin)
npm run build        # tsc -b (type check) + vite build
npm test             # vitest (unit tests, no backend needed)
npm run lint         # oxlint
npm run api:update   # backend running → refresh openapi.json and regenerate src/api/schema.d.ts
```

Run the backend first. From the backend folder, use `docker compose up --build` (Postgres + API on :8080), or `docker compose up -d postgres` plus `mvn spring-boot:run`. The backend URL comes from `VITE_API_BASE_URL` (default `http://localhost:8080`, see `.env.example`).

## The backend contract (what this UI relies on)

`openapi.json` (checked in) is the source of truth, and `src/api/schema.d.ts` is generated from it. **Never edit `schema.d.ts` by hand.** After any backend API change, run `npm run api:update` and fix whatever no longer type-checks. `openapi-typescript` runs through `npx` pinned at 7.13.0, because it needs TypeScript 5 and this project uses TypeScript 7. Don't add it to devDependencies.

| Call | Purpose |
|---|---|
| `POST /v1/batches` | Upload. `Content-Type: application/octet-stream` = the body is ONE payload. `Content-Type: application/x-sift-batch` = several payloads in the batch envelope. Returns `202 {batchId, payloadCount}` immediately; extraction runs in a background worker. |
| `GET /v1/batches?limit=1..200` | Recent batches, newest first: `{count, items: [{batchId, status, createdAt, payloadCount, done, failed, inProgress}]}`. No keys. |
| `GET /v1/batches/{batchId}` | One batch: `{batchId, status, payloadCount, extracts: [{payloadIndex, status, keys, documents, warnings, error}]}`. 404 `BATCH_NOT_FOUND`. |
| `GET /actuator/health/readiness` | `200` when the backend and its DB are up (used for the header badge). |

- **Batch envelope** (`src/api/envelope.ts`, must match the backend's `BatchFrameReader`): `version` (1 byte, = 1), `count` (u32), then `count` × (`length` u32 + bytes). All integers are big-endian unsigned. There is no magic header.
- **Statuses:** batch `busy` | `completed` (completed = every payload is `done` or `failed`). Payload `pending` | `processing` | `done` | `failed`.
- **Keys:** `keys` = distinct key names across all JSON documents in the payload, first-seen order. `documents[]` has `{start, end, partial, keys: [{path, name, depth}]}`. Paths are JSON-Pointer style (`/warehouse/zone`), with array elements as `*`.
- **"No JSON found"** is `status: done` with `keys: []`. It isn't an error. Non-UTF-8 JSON also ends up here.
- **`warnings`** (`SCAN_BUDGET_EXCEEDED`, `DEPTH_LIMIT_EXCEEDED`, `KEY_TRUNCATED`, `PATH_TRUNCATED`, `TOO_MANY_KEYS`) mean the extractor hit a limit and the keys may be incomplete. The payload is still `done`.
- **`error`** `{code, message}`: set on `failed` payloads (`EXTRACTION_ERROR`, `STORAGE_ERROR`, `ATTEMPTS_EXHAUSTED`). It can also be set on a `pending` payload that is waiting to retry.
- **Errors** are RFC 7807 problem details with a stable `code` (e.g. `PAYLOAD_TOO_LARGE`, `EMPTY_PAYLOAD`, `TRUNCATED_FRAME`, `INVALID_PARAMETER`). `ApiError` in `src/api/client.ts` carries `status` and `code`; branch on `code`, not on the message. Network failure = `ApiError` with status 0, code `NETWORK_ERROR`.
- **Limits (backend defaults):** 64 MB per payload, 512 MB per batch, 10,000 payloads per batch. Empty payloads are rejected.
- **CORS:** the backend allows `http://localhost:5173` and `:3000` by default (`sift.cors.allowed-origins`, env `SIFT_CORS_ALLOWED_ORIGINS`). Uploads always trigger a preflight. Multipart is **not** supported: send raw bytes.
- **The backend stores no file names.** The UI remembers them per batch in `localStorage` (`src/lib/uploadNames.ts`), for labels only.

## Code layout

- `src/api/`: `client.ts` (all backend calls, `ApiError`, `describeError`), `hooks.ts` (TanStack Query hooks; polling: a batch every 1 s until completed, the list every 1.5 s while any batch is busy, otherwise every 10 s), `envelope.ts` (+ test), `schema.d.ts` (generated).
- `src/pages/`: `HomePage` (upload + recent batches), `BatchPage` (`/batches/:batchId`).
- `src/components/`: `UploadPanel`, `RecentBatches`, `PayloadDetails`, `StatusBadge`, `BatchProgress`.
- Uploads use plain `fetch` (raw byte body). GETs use the typed `openapi-fetch` client.
