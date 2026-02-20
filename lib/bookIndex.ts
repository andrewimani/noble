import fs from 'fs/promises';
import path from 'path';

export type BookIndexItem = {
  title: string;
  author?: string;
  category: string;
  slug: string;
  href: string;
};

// Read the precomputed index from `content/index.json`.
export async function getBookIndex(): Promise<BookIndexItem[]> {
  const indexPath = path.join(process.cwd(), 'content', 'index.json');
  try {
    const raw = await fs.readFile(indexPath, 'utf8');
    const parsed = JSON.parse(raw) as BookIndexItem[];
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (e) {
    return [];
  }
}

export default getBookIndex;
