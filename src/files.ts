import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".map",
  ".mjs",
  ".svg",
  ".txt",
]);

function extension(path: string): string {
  const index = path.lastIndexOf(".");
  return index < 0 ? "" : path.slice(index).toLowerCase();
}

export async function listScannableFiles(directory: string, maxFileBytes: number): Promise<string[]> {
  const result: string[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (entry.isFile() && TEXT_EXTENSIONS.has(extension(path))) {
        const info = await stat(path);
        if (info.size <= maxFileBytes) result.push(path);
      }
    }
  }

  await walk(directory);
  return result;
}
