import { randomBytes } from "node:crypto";

/** Generate a 32-byte AES-256 key, returned as base64 */
export function generateKey(): string {
  return randomBytes(32).toString("base64");
}

/** Decode a base64-encoded key to Buffer */
export function decodeKey(base64Key: string): Buffer {
  const buf = Buffer.from(base64Key, "base64");
  if (buf.length !== 32) {
    throw new Error(`Invalid key length: expected 32 bytes, got ${buf.length}`);
  }
  return buf;
}
