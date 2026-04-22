/**
 * `.env` 를 먼저 읽고, `.env.local` 의 값으로 덮어씁니다.
 * `KEY=` 처럼 비어 있는 줄은 process.env 를 덮어쓰지 않습니다.
 * (예전 방식: .env.local 을 먼저 읽으면 빈 값이 고정되어 .env 의 실제 값이 무시되는 문제가 있었습니다.)
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const root = path.resolve(__dirname, "..");

function mergeEnvFile(filePath) {
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
