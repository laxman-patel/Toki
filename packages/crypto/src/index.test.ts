import { describe, expect, test } from "bun:test";
import { encrypt, decrypt, generateKey, decodeKey } from "./index.js";

describe("crypto", () => {
  const key = decodeKey(generateKey());

  test("encrypt/decrypt roundtrip", () => {
    const plaintext = "sk-ant-api03-secret-key";
    const encrypted = encrypt(plaintext, key);
    expect(encrypted.split(":")).toHaveLength(3);
    expect(decrypt(encrypted, key)).toBe(plaintext);
  });

  test("different IVs per encryption", () => {
    const a = encrypt("test", key);
    const b = encrypt("test", key);
    expect(a).not.toBe(b);
  });

  test("wrong key fails", () => {
    const otherKey = decodeKey(generateKey());
    const encrypted = encrypt("secret", key);
    expect(() => decrypt(encrypted, otherKey)).toThrow();
  });

  test("invalid format throws", () => {
    expect(() => decrypt("bad", key)).toThrow("Invalid encrypted format");
  });

  test("invalid key length throws", () => {
    expect(() => decodeKey("dG9v")).toThrow("Invalid key length");
  });
});
