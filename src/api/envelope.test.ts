import { describe, expect, it } from 'vitest';
import { buildEnvelope } from './envelope';

const bytes = (...b: number[]) => new Uint8Array(b).buffer;

describe('buildEnvelope', () => {
  it('writes version, count, then length-prefixed payloads (big-endian)', () => {
    const body = buildEnvelope([bytes(1, 2, 3), bytes(9)]);
    expect([...body]).toEqual([
      1, //             version
      0, 0, 0, 2, //    count
      0, 0, 0, 3, 1, 2, 3, // payload 0
      0, 0, 0, 1, 9, //  payload 1
    ]);
  });

  it('matches the backend sample batch built by scripts/MakeFrame.java (174 bytes for A, B, C)', () => {
    // payload sizes of samples/payload_a.hex, payload_b.hex, payload_c.hex
    const body = buildEnvelope([new ArrayBuffer(39), new ArrayBuffer(65), new ArrayBuffer(53)]);
    expect(body.length).toBe(174);
    expect([...body.slice(5, 9)]).toEqual([0, 0, 0, 39]);
  });

  it('handles lengths above 255 (multi-byte big-endian)', () => {
    const body = buildEnvelope([new ArrayBuffer(70_000)]);
    expect([...body.slice(5, 9)]).toEqual([0, 1, 0x11, 0x70]); // 70000 = 0x00011170
  });
});
