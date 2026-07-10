import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import YAML from "yaml";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "node_modules", "dist", "client-dist", "runs"]);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

const files = await walk(root);
const yamlFiles = files.filter((path) => [".yml", ".yaml"].includes(extname(path)));
const jsonFiles = files.filter((path) => extname(path) === ".json" && !path.endsWith("package-lock.json"));
const markdownFiles = files.filter((path) => extname(path) === ".md");
const failures = [];

for (const path of yamlFiles) {
  try {
    YAML.parse(await readFile(path, "utf8"));
  } catch (error) {
    failures.push(`Invalid YAML ${path}: ${error.message}`);
  }
}

for (const path of jsonFiles) {
  try {
    JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    failures.push(`Invalid JSON ${path}: ${error.message}`);
  }
}

const linkPattern = /\[[^\]]*\]\(([^)]+)\)/gu;
for (const path of markdownFiles) {
  const text = await readFile(path, "utf8");
  for (const match of text.matchAll(linkPattern)) {
    let target = match[1].trim();
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    if (/^(?:https?:|mailto:|#)/u.test(target)) continue;
    target = decodeURIComponent(target.split("#", 1)[0]);
    if (!target) continue;
    try {
      await access(resolve(dirname(path), target));
    } catch {
      failures.push(`Broken local link in ${path}: ${target}`);
    }
  }
}

await access(resolve(root, "dist/action/index.cjs"));

if (failures.length > 0) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Repository validation passed (${yamlFiles.length} YAML, ${jsonFiles.length} JSON, ${markdownFiles.length} Markdown).\n`,
  );
}
