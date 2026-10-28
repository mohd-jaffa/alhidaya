// Makes the site's one admin account (plan D14, §26.4):
//
//   npm run admin:create -- --email admin@alhidaya.qa --name "Admin Name"
//
// The password is asked for here, unseen, never taken from the command line
// (it would stay in the shell's history). Locally it uses .env.local; on the
// server, after full payment, it runs once against the production database
// (R8.1, plan D48).
import { existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { parseArgs } from "node:util";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const { values } = parseArgs({ options: { email: { type: "string" }, name: { type: "string" } } });
if (!values.email || !values.name) {
  console.error('Usage: npm run admin:create -- --email admin@alhidaya.qa --name "Admin Name"');
  process.exit(1);
}

// One reader for both answers, buffered, so passwords piped in (as they may
// be over SSH) are each read in turn; on a terminal nothing typed is echoed.
const prompt = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: Boolean(process.stdin.isTTY),
});
(prompt as unknown as { _writeToOutput: (text: string) => void })._writeToOutput = () => {};
const lines = prompt[Symbol.asyncIterator]();

async function askHidden(question: string): Promise<string> {
  process.stdout.write(question);
  const { value } = await lines.next();
  process.stdout.write("\n");
  return typeof value === "string" ? value : "";
}

const password = await askHidden("Password (12 to 128 characters): ");
const again = await askHidden("Password again: ");
prompt.close();
if (password !== again) {
  console.error("The two passwords differ. Nothing was made.");
  process.exit(1);
}

const { createAdmin } = await import("../src/features/auth/createAdmin");
const { closeDb } = await import("../src/db/client");
const { PASSWORD_LENGTH } = await import("../src/constants/limits");
const { VALIDATION_MESSAGES } = await import("../src/constants/messages");
try {
  const { id } = await createAdmin({ email: values.email, name: values.name, password });
  console.log(`Admin account made (${id}).`);
} catch (error) {
  const field = (error as { details?: { field?: string } }).details?.field;
  console.error(
    field === "password"
      ? VALIDATION_MESSAGES.passwordLength(PASSWORD_LENGTH.min, PASSWORD_LENGTH.max)
      : field === "email"
        ? "An admin account with this email already exists."
        : error instanceof Error
          ? error.message
          : "The admin account could not be made.",
  );
  process.exitCode = 1;
} finally {
  await closeDb();
}
