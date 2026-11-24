// Prisma's CLI (migrate/seed) resolves a relative sqlite "file:" URL relative
// to prisma/schema.prisma, while the generated runtime client resolves it
// relative to process.cwd(). To avoid that mismatch on every machine this
// project runs on, we pin DATABASE_URL to an absolute path computed fresh
// here, instead of a relative path baked into a committed .env file.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.join(__dirname, "..");
const dbPath = path.join(root, "prisma", "dev.db");
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

setVar("DATABASE_URL", `file:${dbPath}`);
console.log(`[ensure-env] DATABASE_URL -> file:${dbPath}`);

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
