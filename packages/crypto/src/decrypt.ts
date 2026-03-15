import { createDecipheriv } from "node:crypto";

/**
 * Decrypt AES-256-GCM encrypted string.
 * Input format: "iv_b64:tag_b64:ciphertext_b64"
 */
export function decrypt(encrypted: string, key: Buffer): string {
  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted format: expected iv:tag:ciphertext");
  }
  const iv = Buffer.from(parts[0], "base64");
  const tag = Buffer.from(parts[1], "base64");
  const ciphertext = Buffer.from(parts[2], "base64");

  if (iv.length !== 12) throw new Error("Invalid IV length: expected 12 bytes");
  if (tag.length !== 16) throw new Error("Invalid tag length: expected 16 bytes");

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
