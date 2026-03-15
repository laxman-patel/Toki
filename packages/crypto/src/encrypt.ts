import { createCipheriv, randomBytes } from "node:crypto";

/**
 * Encrypt plaintext with AES-256-GCM.
 * Returns format: "iv_b64:tag_b64:ciphertext_b64"
 */
export function encrypt(plaintext: string, key: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}
