import fs from 'fs/promises';
import path from 'path';

export type BookIndexItem = {
  title: string;
  author?: string;
  category: string;
  slug: string;
  href: string;
};

export async function getBookIndex(): Promise<BookIndexItem[]> {
  const booksDir = path.join(process.cwd(), 'content', 'books');
  let categories: string[] = [];
  try {
    categories = await fs.readdir(booksDir);
  } catch (e) {
    return [];
  }

  const results: BookIndexItem[] = [];

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
        const title = meta.title || slug;
        const author = meta.author || '';
        const item: BookIndexItem = {
          title,
          author,
          category: category,
          slug: meta.slug || slug,
          href: `/book/${meta.slug || slug}`,
        };
        results.push(item);
      } catch (e) {
        // ignore missing/invalid meta
        continue;
      }
    }
  }

  return results;
}
