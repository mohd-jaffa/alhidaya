// Install only this repository's hook, never a global Git configuration.
import { execFileSync } from "node:child_process";

if (!process.env.CI && !process.env.GITHUB_ACTIONS) {
  const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  // A packaged standalone app has no .git; npm install there must not configure hooks.
  let repository = false;
  try {
    repository = git("rev-parse", "--is-inside-work-tree") === "true";
  } catch {
    // No Git checkout.
  }
  if (repository) {
    let existing = "";
    try {
      existing = git("config", "--get", "core.hooksPath");
    } catch {
      // No hook directory configured.
    }
    if (existing && existing !== ".githooks") {
      throw new Error("An existing Git hook directory is configured; combine its pre-push check before changing it.");
    }
    git("config", "--local", "core.hooksPath", ".githooks");
  }
}
