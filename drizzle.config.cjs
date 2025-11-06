const path = require("node:path");
const fs = require("node:fs");
const dotenv = require("dotenv");
const { defineConfig } = require("drizzle-kit");

const envCandidates = [
  path.resolve(__dirname, ".env"),
  path.resolve(__dirname, "server", ".env"),
];

for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate, override: false });
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const schemaPath = path.join(__dirname, "server", "db", "schema.ts").replace(/\\/g, "/");

module.exports = defineConfig({
  out: "./migrations",
  schema: [schemaPath],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
