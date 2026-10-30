import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ADMIN_API = "src/app/api/admin";

/**
 * The admin routes anyone may call (plan §26.4): signing in and the password
 * reset. Each still refuses a request from another site.
 */
const OPEN = new Set(["session POST", "password/forgot POST", "password/reset POST"]);

const walk = (dir: string): string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => (entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));

/** Every exported HTTP handler of every admin route, with its source. */
function handlers(): { name: string; source: string }[] {
  return walk(ADMIN_API)
    .filter((file) => path.basename(file) === "route.ts")
    .flatMap((file) => {
      const route = path.relative(ADMIN_API, path.dirname(file)).split(path.sep).join("/");
      const parts = fs.readFileSync(file, "utf8").split(/(?=^export )/m);
      return parts.flatMap((part) => {
        const method = part.match(/^export (?:async )?function (GET|POST|PUT|PATCH|DELETE)\b/)?.[1];
        return method ? [{ name: `${route} ${method}`, source: part }] : [];
      });
    });
}

describe("the admin API", () => {
  it("is found", () => {
    expect(handlers().map((handler) => handler.name)).toEqual(
      expect.arrayContaining([
        ...OPEN,
        "enquiries GET",
        "enquiries/[id] PATCH",
        "enquiries/[id]/notes POST",
        "applications/[id]/retry-mail POST",
        "applications GET",
        "applications/[id] GET",
        "applications/[id] PATCH",
        "applications/[id] DELETE",
        "applications/[id]/notes POST",
        "applications/[id]/cv GET",
        "enquiries/[id] DELETE",
        "today GET",
        "pages GET",
        "pages/[key] PUT",
        "services GET",
        "services POST",
        "services/[id] PUT",
        "services/[id]/publish POST",
        "services/[id]/archive POST",
        "services/order PUT",
        "services/order/publish POST",
        "jobs GET",
        "jobs POST",
        "jobs/[id] PUT",
        "jobs/[id]/close POST",
        "clients GET",
        "clients/order PUT",
        "media POST",
        "media/[id] PATCH",
        "media/[id] DELETE",
        "site GET",
        "site PUT",
        "site/publish POST",
        "site/brochure POST",
      ]),
    );
  });

  it("checks the admin's session on every route but signing in and the password reset (plan §26.1)", () => {
    const unguarded = handlers()
      .filter((handler) => !OPEN.has(handler.name))
      .filter((handler) => !/withAdminRoute\(\s*request\b/.test(handler.source));
    expect(unguarded.map((handler) => handler.name)).toEqual([]);
  });

  it("refuses another site's request on the routes anyone may call", () => {
    for (const handler of handlers().filter((entry) => OPEN.has(entry.name))) {
      expect(handler.source, handler.name).toContain("assertSameOrigin(request)");
      expect(handler.source, handler.name).toMatch(/withApiHandler\(\s*request\b/);
    }
  });
});
