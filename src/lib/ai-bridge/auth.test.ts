import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: { user: { findUniqueOrThrow: vi.fn(async () => ({ id: "u1", email: "khalilurrahmanridoykhan@gmail.com" })) } },
}));

import { AiBridgeUnauthorized, requireAiSecret, resolveSoleUser, withAiAuth } from "./auth";

// test/setup.ts sets AI_BACKEND_SECRET="test-ai-backend-secret-0123456789"
// and AI_BOUND_USER_EMAIL="test-admin@daybook.local".

function req(headers: Record<string, string> = {}) {
  return new Request("https://example.com", { headers });
}

describe("requireAiSecret", () => {
  it("throws when the header is missing", () => {
    expect(() => requireAiSecret(req())).toThrow(AiBridgeUnauthorized);
  });

  it("throws when the secret is wrong", () => {
    expect(() => requireAiSecret(req({ authorization: "Bearer wrong-secret" }))).toThrow(AiBridgeUnauthorized);
  });

  it("does not throw when the secret matches", () => {
    expect(() =>
      requireAiSecret(req({ authorization: "Bearer test-ai-backend-secret-0123456789" })),
    ).not.toThrow();
  });
});

describe("resolveSoleUser", () => {
  it("always resolves the AI_BOUND_USER_EMAIL account, ignoring any caller-supplied identity", async () => {
    const user = await resolveSoleUser();
    expect(user.id).toBe("u1");
  });
});

describe("withAiAuth", () => {
  it("returns 401 with no secret header", async () => {
    const result = await withAiAuth(req(), async () => "should not run");
    expect(result).not.toBe("should not run");
    const response = result as Response;
    expect(response.status).toBe(401);
  });

  it("returns 401 with the wrong secret", async () => {
    const result = await withAiAuth(req({ authorization: "Bearer nope" }), async () => "should not run");
    const response = result as Response;
    expect(response.status).toBe(401);
  });

  it("calls the handler with the resolved sole user when the secret is correct", async () => {
    const result = await withAiAuth(
      req({ authorization: "Bearer test-ai-backend-secret-0123456789" }),
      async (user) => `hello ${user.id}`,
    );
    expect(result).toBe("hello u1");
  });
});
