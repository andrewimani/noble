import fs from 'fs/promises';
import path from 'path';
import generateIndex from './generateIndex';
import { Book } from './types';

const INDEX_PATH = path.join(process.cwd(), 'content', 'index.json');
const BOOKS_DIR = path.join(process.cwd(), 'content', 'books');

async function indexIsStale(): Promise<boolean> {
  try {
    const idxStat = await fs.stat(INDEX_PATH);
    let newest = 0;
    try {
      const categories = await fs.readdir(BOOKS_DIR);
      for (const category of categories) {
        const categoryPath = path.join(BOOKS_DIR, category);
        let stat;
        try {
          stat = await fs.stat(categoryPath);
        } catch (e) {
          continue;
        }
        if (!stat.isDirectory()) continue;
        const slugs = await fs.readdir(categoryPath);
        for (const slug of slugs) {
          const metaPath = path.join(categoryPath, slug, 'meta.json');
          try {
            const mstat = await fs.stat(metaPath);
            if (mstat.mtimeMs > newest) newest = mstat.mtimeMs;
          } catch (e) {
            continue;
          }
        }
      }
    } catch (e) {
      return true;
    }
    return newest > idxStat.mtimeMs;
  } catch (e) {
    // index file doesn't exist
    return true;
  }
}

let __indexCheckStarted = false;
async function ensureIndexOnce() {
  if (__indexCheckStarted) return;
  __indexCheckStarted = true;
  try {
    const stale = await indexIsStale();
    if (stale) {
      await generateIndex();
    }
  } catch (err) {
    console.error('Error ensuring index:', err);
  }
}

// Start a background check on module import (runs once per process).
;(async () => {
  try {
    // use globalThis to avoid duplicate work across module reloads
    if (!(globalThis as any).__noble_index_check_started) {
      (globalThis as any).__noble_index_check_started = true;
      ensureIndexOnce().catch((e) => console.error('ensureIndexOnce error:', e));
    }
  } catch (e) {
    // ignore
  }
})();

// Read the precomputed index from `content/index.json`.
export async function getBookIndex(): Promise<Book[]> {
  try {
    const raw = await fs.readFile(INDEX_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Book[];
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (e) {
    return [];
  }
}

export default getBookIndex;
