/**
 * Builds an `application/x-sift-batch` body: several payloads in one request.
 *
 * Layout (all integers big-endian unsigned), must match the backend's BatchFrameReader:
 *   version  1 byte   (= 1)
 *   count    4 bytes
 *   count x { length 4 bytes, then `length` bytes of payload }
 */
export const ENVELOPE_VERSION = 1;

export function buildEnvelope(payloads: ArrayBuffer[]): Uint8Array<ArrayBuffer> {
  const size = 5 + payloads.reduce((n, p) => n + 4 + p.byteLength, 0);
  const out = new Uint8Array(size);
  const view = new DataView(out.buffer); // DataView writes big-endian by default

  view.setUint8(0, ENVELOPE_VERSION);
  view.setUint32(1, payloads.length);
  let offset = 5;
  for (const p of payloads) {
    view.setUint32(offset, p.byteLength);
    offset += 4;
    out.set(new Uint8Array(p), offset);
    offset += p.byteLength;
  }
  return out;
}
