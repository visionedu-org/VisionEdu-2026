import "@testing-library/jest-dom/vitest";
import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "@/mocks/node";
import { resetAuthHandlers } from "@/mocks/handlers/auth";
import { resetGamificationMemory } from "@/mocks/gamification-memory";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetAuthHandlers();
  resetGamificationMemory();
});
afterAll(() => server.close());
