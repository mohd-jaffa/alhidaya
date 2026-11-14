import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

// The release path (docs/RELEASE.md D2, E6, E7): a workflow that deploys only when started by hand, and two scripts
// that put the build on the client's server. These tests read them as text, as the maintenance kit's do; the
// behaviour of release-remote.sh is proven in a Linux container by scripts/test-release-remote.sh, and the whole
// path is rehearsed on the preview host before the real domain is touched.
const workflow = readFileSync(".github/workflows/release.yml", "utf8");
const deploy = readFileSync("scripts/release-deploy.sh", "utf8");
const remote = readFileSync("scripts/release-remote.sh", "utf8");
const importer = readFileSync("scripts/content-import.sh", "utf8");
const importerRemote = readFileSync("scripts/content-import.remote.sh", "utf8");

/** Every line inside a `run: |` block, as a shell would receive it. */
function runLines(source: string): string[] {
  const lines = source.split("\n");
  const found: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    const start = /^(\s*)(?:- )?run: \|\s*$/.exec(lines[index] ?? "");
    if (!start) continue;
    const indent = (start[1] ?? "").length;
    for (let next = index + 1; next < lines.length; next++) {
      const line = lines[next] ?? "";
      if (line.trim() !== "" && line.search(/\S/) <= indent) break;
      found.push(line);
    }
  }
  return found;
}

describe("release workflow", () => {
  it("starts only by hand: a push, a pull request, a tag or a timer never deploys", () => {
    const triggers = workflow.slice(workflow.indexOf("\non:\n"), workflow.indexOf("\npermissions:"));
    expect(triggers).toContain("workflow_dispatch:");
    expect(triggers).not.toMatch(/^ {2}(push|pull_request|pull_request_target|schedule|release|workflow_run|create):/m);
  });

  it("runs only from main, one at a time, never cancelled halfway", () => {
    expect(workflow).toContain("github.ref != 'refs/heads/main'");
    expect(workflow).toMatch(/concurrency:\s+group: release\s+cancel-in-progress: false/);
  });

  it("has read-only repository rights, and reads other runs' artifacts only in the jobs that need it", () => {
    expect(workflow).toMatch(/^permissions:\n {2}contents: read\n/m);
    expect(workflow).not.toMatch(/contents: write|packages: write|id-token: write/);
  });

  it("pins every third-party action to a commit", () => {
    const uses = [...workflow.matchAll(/^\s*(?:- )?uses: (\S+)/gm)].map((match) => match[1] ?? "");
    expect(uses.length).toBeGreaterThan(4);
    for (const action of uses) expect(action).toMatch(/^(\.\/\S+|[\w.-]+\/[\w.-]+@[0-9a-f]{40})$/);
  });

  it("never puts a secret or an input into shell text, only into the environment", () => {
    for (const line of workflow.split("\n").filter((text) => text.includes("secrets."))) {
      expect(line).toMatch(/^\s+[A-Z_]+: \$\{\{ secrets\.[A-Z_]+ \}\}$/);
    }
    for (const line of runLines(workflow)) expect(line).not.toContain("${{");
  });

  it("re-runs CI, builds once with the live address, checks and prunes the folder, then packs it", () => {
    expect(workflow).toContain("uses: ./.github/workflows/ci.yml");
    expect(workflow).toMatch(/npm run build\n\s+env:\n\s+NEXT_PUBLIC_SITE_URL: https:\/\/alhidaya\.qa\n/);
    const check = workflow.indexOf("node scripts/check-deploy-output.mjs --prune .next/standalone");
    const pack = workflow.indexOf("tar -czf dist/release.tar.gz");
    expect(check).toBeGreaterThan(0);
    expect(pack).toBeGreaterThan(check);
    expect(workflow).toContain("sha256sum release.tar.gz > release.tar.gz.sha256");
    expect(workflow).toContain("retention-days: 14");
  });

  it("promotes the rehearsed build to production without building again, after a typed confirmation", () => {
    expect(workflow).toContain('[ "$CONFIRM" = "deploy alhidaya.qa" ]');
    expect(workflow).toContain("^v[0-9]+\\.[0-9]+\\.[0-9]+$");
    expect(workflow).toContain('[ "$run" = "Release success" ]');
    // CI and the build run for the rehearsal only; production takes the rehearsal's artifact by run id.
    expect(workflow.match(/if: \$\{\{ inputs\.target == 'rehearsal' \}\}/g)?.length).toBeGreaterThanOrEqual(3);
    expect(workflow).toContain("run-id: ${{ inputs.rehearsed_run }}");
    expect(workflow).toContain("(cd dist && sha256sum -c release.tar.gz.sha256)");
    expect(workflow).toContain('[ "$(cat dist/COMMIT)" = "$SHA" ]');
  });

  it("deploys through the one script, with the key written privately and removed again", () => {
    expect(workflow).toContain("scripts/release-deploy.sh");
    expect(workflow).toContain("umask 077");
    expect(workflow).toMatch(/trap 'rm -f "\$key" "\$known"' EXIT/);
    expect(workflow).toContain("APP: ${{ inputs.target == 'production' && 'alhidaya-site' || 'alhidaya-rehearsal' }}");
    expect(workflow).toContain(
      "DOMAIN: ${{ inputs.target == 'production' && 'alhidaya.qa' || 'preview.alhidaya.qa' }}",
    );
  });
});

describe("release-deploy.sh", () => {
  it("does its steps in the safe order: space, upload and check, save the database, migrate, switch, tidy", () => {
    const order = [
      'remote space "$app"',
      'remote prepare "$app"',
      'remote dump "$app"',
      "npx drizzle-kit migrate",
      'remote activate "$app"',
      'remote prune "$app"',
    ].map((step) => deploy.indexOf(step));
    for (const position of order) expect(position).toBeGreaterThan(0);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("removes the unpacked release again when anything before the switch fails", () => {
    expect(deploy.match(/abort_release\n\s+exit 1/g)?.length).toBeGreaterThanOrEqual(3);
    expect(deploy).toContain("the site did not change");
  });

  it("reads the migration login from the server at the moment it is needed and never prints or stores it", () => {
    expect(deploy).toContain(".secrets.env");
    expect(deploy).toContain("::add-mask::$db_password");
    expect(deploy).not.toMatch(/set -x|set -o xtrace/);
    // The one echo that names the password is GitHub's own masking command, which hides it from the log.
    const echoes = deploy
      .split("\n")
      .filter((line) => /\b(echo|printf)\b/.test(line) && !line.includes("::add-mask::"));
    for (const line of echoes) expect(line).not.toMatch(/\$\{?(db_password|login)\b/);
    expect(deploy).not.toMatch(/>\s*[^\s&]*(\.env|secrets)/);
  });

  it("checks every value that reaches a remote path or command before using it", () => {
    for (const pattern of [
      "--app is not a plain folder name",
      "--release-id is not valid",
      "--domain is not a plain host name",
    ]) {
      expect(deploy).toContain(pattern);
    }
  });
});

describe("release-remote.sh", () => {
  it("refuses a damaged, unsafe or incomplete archive and removes what it unpacked", () => {
    expect(remote).toContain("the archive's SHA-256 differs from the one built");
    expect(remote).toContain("(^|/)\\.\\.(/|$)");
    expect(remote).toContain("--no-same-owner");
    for (const required of ["server.js", "package.json", ".next/static", "public"]) expect(remote).toContain(required);
    for (const forbidden of [".env", ".env.production", ".env.local"]) expect(remote).toContain(forbidden);
    expect(remote).toContain("a release is never overwritten");
  });

  it("switches in one atomic rename and rolls back by itself when the site does not answer", () => {
    expect(remote).toContain('mv -T "$dir/current.$$" "$dir/current"');
    expect(remote).toContain("ROLLED BACK to");
    expect(remote).toContain("X-Release-Check");
  });

  it("never prints the database login and only removes releases it names", () => {
    expect(remote).not.toMatch(/set -x|set -o xtrace/);
    expect(remote).not.toMatch(/(echo|printf)[^\n]*(\$MYSQL_PWD|BASH_REMATCH\[2\])/);
    expect(remote).toContain("export MYSQL_PWD");
    expect(remote).toContain("^[0-9]{8}-[0-9]{6}-[0-9a-f]{7,40}$");
    expect(remote).toContain("is the live one; it is not removed");
  });
});

describe("content import", () => {
  it("copies the media first, then the rows, then restarts the app so it sees them", () => {
    const order = ["remote media", "remote db", "bash -s -- restart"].map((step) => importer.indexOf(step));
    for (const position of order) expect(position).toBeGreaterThan(0);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("never overwrites content that is already there, and checks what it loaded against the export", () => {
    expect(importerRemote).toContain("the import never overwrites content");
    expect(importerRemote).toContain("the counts differ from the export; the content tables were emptied again");
    // The only row it may replace is the one migration 0007 makes: untouched, with no editor.
    expect(importerRemote).toContain("\\`key\\` = 'TYPOGRAPHY' AND updated_by IS NULL");
  });

  it("uses the app's own data-rights login, never prints it, and writes only inside public_html", () => {
    expect(importerRemote).toContain("DATABASE_URL=");
    expect(importerRemote).not.toContain("MIGRATION_DATABASE_URL");
    expect(importerRemote).not.toMatch(/set -x|set -o xtrace/);
    expect(importerRemote).not.toMatch(/(echo|printf)[^\n]*(\$MYSQL_PWD|BASH_REMATCH\[2\])/);
    expect(importerRemote).toContain("the media folder must be a plain path inside public_html");
    expect(importer).toContain("--media-dir must be a plain path inside public_html");
    expect(importerRemote).toContain("the media folder has no .htaccess");
  });
});
