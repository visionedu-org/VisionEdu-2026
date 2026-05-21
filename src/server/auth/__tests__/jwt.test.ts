import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  signAccessToken,
  verifyAccessToken,
  expiresInForRole,
} from "../jwt";

describe("jwt auth", () => {
  const prevSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET =
      "test-secret-key-with-at-least-32-characters-long";
    process.env.JWT_EXPIRES_IN_STUDENT = "3600";
    process.env.JWT_EXPIRES_IN_TEACHER = "7200";
  });

  afterEach(() => {
    process.env.JWT_SECRET = prevSecret;
  });

  it("signAccessToken embeds role in claims", async () => {
    const { token, expiresIn } = await signAccessToken({
      userId: "user-1",
      role: "student",
      email: "a@b.co",
    });
    expect(expiresIn).toBe(3600);
    const payload = await verifyAccessToken(token);
    expect(payload?.sub).toBe("user-1");
    expect(payload?.role).toBe("student");
    expect(payload?.email).toBe("a@b.co");
  });

  it("verifyAccessToken rejects invalid token", async () => {
    const payload = await verifyAccessToken("invalid.token.here");
    expect(payload).toBeNull();
  });

  it("expiresInForRole differs by role", () => {
    expect(expiresInForRole("student")).toBe(3600);
    expect(expiresInForRole("teacher")).toBe(7200);
  });
});
