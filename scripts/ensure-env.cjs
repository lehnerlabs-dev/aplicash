// Local/dev convenience only. On Vercel (or any host that injects real
// environment variables), skip entirely: DATABASE_URL and admin creds must
// be set as real project environment variables there, not written to a
// .env file that a serverless build step can't hand to the runtime anyway.
if (process.env.VERCEL) {
  console.log("[ensure-env] VERCEL detected, skipping local .env setup");
  process.exit(0);
}

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");

let contents = "";
if (fs.existsSync(envPath)) {
  contents = fs.readFileSync(envPath, "utf8");
}

function setVar(key, value) {
  const line = `${key}="${value}"`;
  if (new RegExp(`^${key}=`, "m").test(contents)) {
    contents = contents.replace(new RegExp(`^${key}=.*$`, "m"), line);
  } else {
    contents = contents.trimEnd() + (contents ? "\n" : "") + line + "\n";
  }
}

if (!/^DATABASE_URL=/m.test(contents)) {
  console.warn(
    "[ensure-env] DATABASE_URL is not set in .env — copy .env.example and " +
      "point it at a Postgres database (see README).",
  );
}

// /admin is protected by Basic Auth (see src/proxy.ts) and fails closed if
// these are unset. Generate a random password on first run per machine
// instead of committing a fixed one.
if (!/^ADMIN_PASSWORD=/m.test(contents)) {
  const generatedPassword = crypto.randomBytes(9).toString("base64url");
  setVar("ADMIN_USER", "admin");
  setVar("ADMIN_PASSWORD", generatedPassword);
  console.log(
    `[ensure-env] generated admin credentials -> user=admin password=${generatedPassword}`,
  );
  console.log(
    "[ensure-env] saved to .env — change ADMIN_PASSWORD there any time",
  );
}

fs.writeFileSync(envPath, contents);
