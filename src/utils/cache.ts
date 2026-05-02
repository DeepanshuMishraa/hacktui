import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const CACHE_DIR = join(tmpdir(), "hacktui");
const CACHE_FILE = join(CACHE_DIR, "query-cache.json");

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function readCache(): Record<string, string> {
  try {
    ensureCacheDir();
    const raw = readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeCache(data: Record<string, string>) {
  ensureCacheDir();
  writeFileSync(CACHE_FILE, JSON.stringify(data), "utf-8");
}

let cache = readCache();

export const fileStorage = {
  getItem: (key: string): string | null => cache[key] ?? null,
  setItem: (key: string, value: string) => {
    cache[key] = value;
    writeCache(cache);
  },
  removeItem: (key: string) => {
    delete cache[key];
    writeCache(cache);
  },
};
