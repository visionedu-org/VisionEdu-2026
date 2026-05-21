import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveDraft, loadDraft, clearDraft } from "./activity-draft";

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  });
});

describe("activity-draft", () => {
  it("saves and loads draft", () => {
    const draft = {
      answers: [{ questionId: "q1", optionId: "a" }],
      currentIndex: 1,
      updatedAt: new Date().toISOString(),
    };
    saveDraft("act-1", draft);
    expect(loadDraft("act-1")).toEqual(draft);
  });

  it("clearDraft removes data", () => {
    saveDraft("act-1", {
      answers: [],
      currentIndex: 0,
      updatedAt: new Date().toISOString(),
    });
    clearDraft("act-1");
    expect(loadDraft("act-1")).toBeNull();
  });

  it("returns null for corrupt JSON", () => {
    store.set("visionedu:activity:bad", "{not json");
    expect(loadDraft("bad")).toBeNull();
  });
});
