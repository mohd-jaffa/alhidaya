import { vi } from "vitest";

// Next's data cache lives inside the running app; against the local MySQL the reads go straight to the database.
vi.mock("next/cache", () => ({
  unstable_cache: (read: () => Promise<unknown>) => read,
  revalidateTag: vi.fn(),
}));
