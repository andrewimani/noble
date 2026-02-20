import fs from 'fs/promises';
import path from 'path';

export type BookIndexItem = {
  title: string;
  author?: string;
  category: string;
  slug: string;
  href: string;
};

export async function generateIndex(): Promise<BookIndexItem[]> {
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
