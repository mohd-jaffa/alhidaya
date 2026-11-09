// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/media/[...key]/route";
import { stubServerEnv } from "@tests/support/env";

let root = "";
beforeEach(async () => {
  root = path.join(await fs.mkdtemp(path.join(os.tmpdir(), "alhidaya-serve-")), "media");
  await fs.mkdir(path.join(root, "2026-10"), { recursive: true });
  await fs.writeFile(path.join(root, "2026-10", "abcdefghij-w480.webp"), "webp bytes");
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await fs.rm(path.dirname(root), { recursive: true, force: true });
});

const get = (key: string[]) => GET(new Request("http://localhost/media"), { params: Promise.resolve({ key }) });

describe("GET /media/…", () => {
  it("serves a file the app made, with its own type, never sniffed, cached for a year", async () => {
    stubServerEnv({ MEDIA_DIR: root, SERVE_MEDIA: "true" });
    const response = await get(["2026-10", "abcdefghij-w480.webp"]);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(await response.text()).toBe("webp bytes");
  });

  it("answers 404 for a missing file and for anything that is not a key the app made", async () => {
    stubServerEnv({ MEDIA_DIR: root, SERVE_MEDIA: "true" });
    for (const key of [
      ["2026-10", "abcdefghij-w800.webp"],
      ["..", "..", "etc", "passwd"],
      ["2026-10", "x.php"],
    ])
      expect((await get(key)).status, key.join("/")).toBe(404);
  });

  it("serves nothing where Apache serves the folder", async () => {
    vi.stubEnv("SERVE_MEDIA", undefined);
    stubServerEnv({ MEDIA_DIR: root });
    expect((await get(["2026-10", "abcdefghij-w480.webp"])).status).toBe(404);
  });
});
