// Prisma's CLI (migrate/seed) resolves a relative sqlite "file:" URL relative
// to prisma/schema.prisma, while the generated runtime client resolves it
// relative to process.cwd(). To avoid that mismatch on every machine this
// project runs on, we pin DATABASE_URL to an absolute path computed fresh
// here, instead of a relative path baked into a committed .env file.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dbPath = path.join(root, "prisma", "dev.db");
const envPath = path.join(root, ".env");
const line = `DATABASE_URL="file:${dbPath}"`;

let contents = "";
if (fs.existsSync(envPath)) {
  contents = fs.readFileSync(envPath, "utf8");
}

if (/^DATABASE_URL=/m.test(contents)) {
  contents = contents.replace(/^DATABASE_URL=.*$/m, line);
} else {
  contents = contents.trimEnd() + (contents ? "\n" : "") + line + "\n";
}

fs.writeFileSync(envPath, contents);
console.log(`[ensure-env] DATABASE_URL -> file:${dbPath}`);
