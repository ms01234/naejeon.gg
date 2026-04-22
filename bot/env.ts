import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function mergeEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const parsed = dotenv.parse(fs.readFileSync(filePath));
  for (const [key, value] of Object.entries(parsed)) {
    if (value == null) continue;
    const trimmed = String(value).trim();
    if (trimmed === "") continue;
    process.env[key] = trimmed;
  }
}

mergeEnvFile(path.join(root, ".env"));
mergeEnvFile(path.join(root, ".env.local"));
