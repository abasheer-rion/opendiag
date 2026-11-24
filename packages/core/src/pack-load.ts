import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PackRegistry } from "./pack-lint.ts";
import type { Namespace } from "./pack-lint.ts";

export interface RejectedPack {
  file: string;
  errors: string[];
}

/** The namespace a pack file belongs to, from its path. Anything under a share-alike folder is share-alike. */
export function namespaceOf(path: string): Namespace {
  return path.split(/[\\/]/).includes("share-alike") ? "share-alike" : "main";
}

/**
 * Load every *.json pack under `root` (main packs) and `root/share-alike` (share-alike packs) into one registry
 * with two separate namespaces. Packs that fail lint, including the policy block list, are not loaded and are
 * listed in `rejected`. Symlinks are skipped.
 */
export function loadPackDir(root: string): { registry: PackRegistry; rejected: RejectedPack[] } {
  const registry = new PackRegistry();
  const rejected: RejectedPack[] = [];
  const scan = (dir: string, ns: Namespace) => {
    let names: string[] = [];
    try {
      names = readdirSync(dir).sort();
    } catch {
      return;
    }
    for (const n of names) {
      const file = join(dir, n);
      if (!n.endsWith(".json") || !lstatSync(file).isFile()) continue;
      try {
        registry.add(ns, JSON.parse(readFileSync(file, "utf8")));
      } catch (e) {
        const errors = e instanceof Error && "problems" in e ? ((e as { problems: string[] }).problems) : [e instanceof Error ? e.message : String(e)];
        rejected.push({ file, errors });
      }
    }
  };
  scan(root, "main");
  scan(join(root, "share-alike"), "share-alike");
  return { registry, rejected };
}
