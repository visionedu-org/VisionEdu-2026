import { describe, expect, it, beforeEach } from "vitest";
import { useAuthStore } from "./auth-store";

describe("auth store", () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it("setSession sets expiresAt from expires_in", () => {
    useAuthStore.getState().setSession({
      access_token: "tok",
      expires_in: 28800,
      user: {
        id: "1",
        name: "Test",
        email: "t@t.co",
        role: "student",
      },
    });
    const { expiresAt, accessToken } = useAuthStore.getState();
    expect(accessToken).toBe("tok");
    expect(expiresAt).toBeGreaterThan(Date.now());
  });

  it("isExpired returns true when no session", () => {
    expect(useAuthStore.getState().isExpired()).toBe(true);
  });
});
