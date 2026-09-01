import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "./crypto";

describe("token vault", () => {
  it("round-trips a value", () => {
    const secret = "ya29.a0AfH6SMB-fake-google-refresh-token";
    expect(decrypt(encrypt(secret))).toBe(secret);
  });

  it("produces a fresh IV each time", () => {
    expect(encrypt("same")).not.toBe(encrypt("same"));
  });

  it("rejects a tampered ciphertext", () => {
    const payload = encrypt("hello");
    const bytes = Buffer.from(payload, "base64");
    bytes[bytes.length - 1] ^= 0x01;
    expect(() => decrypt(bytes.toString("base64"))).toThrow();
  });
});
