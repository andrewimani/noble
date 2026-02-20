import fs from 'fs/promises';
import path from 'path';
import { Book } from './types';

export async function generateIndex(): Promise<Book[]> {
  const booksDir = path.join(process.cwd(), 'content', 'books');
  const outPath = path.join(process.cwd(), 'content', 'index.json');

  let categories: string[] = [];
  try {
    categories = await fs.readdir(booksDir);
  } catch (e) {
    // no books dir, write empty index
    await fs.mkdir(path.join(process.cwd(), 'content'), {recursive: true});
    await fs.writeFile(outPath, JSON.stringify([], null, 2), 'utf8');
    return [];
  }

  const results: Book[] = [];

  for (const category of categories) {
    const categoryPath = path.join(booksDir, category);
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
        const raw = await fs.readFile(metaPath, 'utf8');
        const meta = JSON.parse(raw);
        const id = (meta.id || meta.slug || slug || '') as string;
        const title = String(meta.title || slug || id);
        const author = String(meta.author || '');
        const description = meta.description ? String(meta.description) : undefined;
        const publishedYear = typeof meta.publishedYear === 'number' ? meta.publishedYear : (meta.publishedYear ? Number(meta.publishedYear) : undefined);
        const tags = Array.isArray(meta.tags) ? meta.tags.map(String) : undefined;

        const item: Book = {
          id,
          title,
          author,
          category: category,
        };
        if (description) item.description = description;
        if (typeof publishedYear === 'number' && !Number.isNaN(publishedYear)) item.publishedYear = publishedYear;
        if (tags) item.tags = tags;

        results.push(item);
      } catch (e) {
        continue;
      }
    }
  }

  try {
    await fs.writeFile(outPath, JSON.stringify(results, null, 2), 'utf8');
  } catch (e) {
    // ignore write errors
  }

  return results;
}

export default generateIndex;
