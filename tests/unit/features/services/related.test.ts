import { describe, expect, it, vi } from "vitest";

import { chooseRelatedServices } from "@/features/services/related";
import { publishedFixture, serviceFixture } from "@tests/support/fixtures/content";

const random = vi.hoisted(() => vi.fn(() => 1));
vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();
  return { ...actual, randomInt: random, default: { ...actual, randomInt: random } };
});

describe("chooseRelatedServices", () => {
  it("selects three distinct services without mutating or reordering the published candidates", () => {
    const services = Array.from({ length: 5 }, () => publishedFixture(serviceFixture()));
    const original = [...services];
    const chosen = chooseRelatedServices(services);
    expect(chosen).toEqual([services[0], services[3], services[4]]);
    expect(new Set(chosen.map((s) => s.id)).size).toBe(3);
    expect(services).toEqual(original);
    expect(random.mock.calls).toEqual([[5], [4]]);
  });
  it("keeps all available related services when fewer than three exist", () => {
    const services = [publishedFixture(serviceFixture())];
    expect(chooseRelatedServices(services)).toEqual(services);
    expect(chooseRelatedServices([])).toEqual([]);
  });
});
