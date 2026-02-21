import fs from 'fs/promises';
import path from 'path';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const booksDir = path.join(process.cwd(), 'content', 'books');
  try {
    const categories = await fs.readdir(booksDir);
    for (const category of categories) {
      const metaPath = path.join(booksDir, category, id, 'meta.json');
      try {
        const raw = await fs.readFile(metaPath, 'utf8');
        const meta = JSON.parse(raw);
        return new Response(JSON.stringify({ ...meta, formats: ['md', 'txt'] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        continue;
      }
    }
  } catch (e) {
    // ignore
  }
  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
}
