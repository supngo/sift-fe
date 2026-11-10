import createClient from 'openapi-fetch';
import { buildEnvelope } from './envelope';
import type { components, paths } from './schema';

// Types generated from openapi.json (npm run api:update). Never edit schema.d.ts by hand.
export type BatchSummary = components['schemas']['BatchSummary'];
export type BatchResult = components['schemas']['BatchResult'];
export type PayloadExtract = components['schemas']['PayloadExtract'];
export type AcceptedBatch = components['schemas']['AcceptedBatch'];
type ProblemDetail = components['schemas']['ProblemDetail'] & { code?: string };

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = createClient<paths>({ baseUrl: API_BASE_URL });

/** An error answered by the backend (RFC 7807 problem detail), or a network failure (status 0). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const unreachable = () =>
  new ApiError(0, 'NETWORK_ERROR', `Cannot reach the backend at ${API_BASE_URL}. Is it running?`);

function fromProblem(status: number, body: unknown): ApiError {
  const p = (body ?? {}) as ProblemDetail;
  return new ApiError(status, p.code ?? `HTTP_${status}`, p.detail ?? p.title ?? `Request failed (${status})`);
}

/** Turns anything thrown by the calls below into a short message for the UI. */
export function describeError(e: unknown): string {
  if (e instanceof ApiError) {
    return e.status === 0 ? e.message : `${e.code}: ${e.message}`;
  }
  return e instanceof Error ? e.message : String(e);
}

export async function listBatches(limit = 50): Promise<BatchSummary[]> {
  const res = await api.GET('/v1/batches', { params: { query: { limit } } }).catch(() => {
    throw unreachable();
  });
  if (!res.data) {
    throw fromProblem(res.response.status, res.error);
  }
  return res.data.items;
}

export async function getBatch(batchId: string): Promise<BatchResult> {
  const res = await api.GET('/v1/batches/{batchId}', { params: { path: { batchId } } }).catch(() => {
    throw unreachable();
  });
  if (!res.data) {
    throw fromProblem(res.response.status, res.error);
  }
  return res.data;
}

/**
 * One file is sent as-is (application/octet-stream); several are wrapped in the batch envelope
 * (application/x-sift-batch). Either way the backend creates one batch, one payload per file, in order.
 * Plain fetch here: the body is raw bytes, which the generated client models as a string.
 */
export async function uploadFiles(files: File[]): Promise<AcceptedBatch> {
  const single = files.length === 1;
  const body = single ? files[0] : buildEnvelope(await Promise.all(files.map((f) => f.arrayBuffer())));
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/v1/batches`, {
      method: 'POST',
      headers: { 'Content-Type': single ? 'application/octet-stream' : 'application/x-sift-batch' },
      body,
    });
  } catch {
    throw unreachable();
  }
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw fromProblem(res.status, json);
  }
  return json as AcceptedBatch;
}

/** True when the backend's readiness probe says UP (CORS is open for /actuator/health/**). */
export async function isBackendReady(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/actuator/health/readiness`);
    return res.ok;
  } catch {
    return false;
  }
}
