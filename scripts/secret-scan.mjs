import { readFile, readdir } from "node:fs/promises";
import { extname, resolve } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "node_modules", "client-dist", "runs"]);
const ignoredExtensions = new Set([".ico", ".jpg", ".jpeg", ".png", ".woff", ".woff2"]);
const signatures = [
  ["GitHub token", /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,255}\b/gu],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/gu],
  ["private key block", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/gu],
  ["Stripe live secret", /\bsk_live_[A-Za-z0-9]{16,}\b/gu],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/gu],
];

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(path)));
    else if (!ignoredExtensions.has(extname(path).toLowerCase())) result.push(path);
  }
  return result;
}

const findings = [];
for (const path of await walk(root)) {
  const text = await readFile(path, "utf8").catch(() => "");
  for (const [label, signature] of signatures) {
    signature.lastIndex = 0;
    if (signature.test(text)) findings.push(`${label}: ${path}`);
  }
}

if (findings.length > 0) {
  process.stderr.write(`Potential secrets detected:\n${findings.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Secret signature scan passed.\n");
}
