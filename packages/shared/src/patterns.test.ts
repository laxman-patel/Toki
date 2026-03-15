import { describe, expect, test } from "bun:test";
import { hostMatches, pathMatches } from "./patterns.js";

describe("hostMatches", () => {
  test("exact match", () => {
    expect(hostMatches("api.anthropic.com", "api.anthropic.com")).toBe(true);
    expect(hostMatches("api.openai.com", "api.anthropic.com")).toBe(false);
  });

  test("wildcard match", () => {
    expect(hostMatches("api.example.com", "*.example.com")).toBe(true);
    expect(hostMatches("sub.api.example.com", "*.example.com")).toBe(true);
    expect(hostMatches("example.com", "*.example.com")).toBe(false);
  });
});

describe("pathMatches", () => {
  test("null pattern matches all", () => {
    expect(pathMatches("/anything", null)).toBe(true);
  });

  test("wildcard matches all", () => {
    expect(pathMatches("/anything", "*")).toBe(true);
  });

  test("prefix pattern", () => {
    expect(pathMatches("/v1/messages", "/v1/*")).toBe(true);
    expect(pathMatches("/v1", "/v1/*")).toBe(true);
    expect(pathMatches("/v1beta", "/v1/*")).toBe(false);
    expect(pathMatches("/v2/messages", "/v1/*")).toBe(false);
  });

  test("exact match", () => {
    expect(pathMatches("/v1/messages", "/v1/messages")).toBe(true);
    expect(pathMatches("/v1/chat", "/v1/messages")).toBe(false);
  });
});
