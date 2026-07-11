function stripInlineComment(value: string): string {
  for (let index = 1; index < value.length; index += 1) {
    const previous = value[index - 1];
    if (value[index] === "#" && (previous === " " || previous === "\t")) {
      return value.slice(0, index).trimEnd();
    }
  }

  return value.trimEnd();
}

export function parseEnv(text: string): Map<string, string> {
  const entries = new Map<string, string>();

  for (const rawLine of text.replace(/^\uFEFF/, "").split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const normalized = line.startsWith("export ") ? line.slice(7).trimStart() : line;
    const separator = normalized.indexOf("=");
    if (separator < 1) continue;

    const key = normalized.slice(0, separator).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/u.test(key)) continue;

    let value = normalized.slice(separator + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    } else {
      value = stripInlineComment(value);
    }

    entries.set(key, value);
  }

  return entries;
}
