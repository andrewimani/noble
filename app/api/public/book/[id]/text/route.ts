import fs from 'fs/promises';
import path from 'path';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const start = Number(url.searchParams.get('start') || '0') || 0;
  const length = Number(url.searchParams.get('length') || '2000') || 2000;
  const id = params.id;

  const booksDir = path.join(process.cwd(), 'content', 'books');
  try {
    const categories = await fs.readdir(booksDir);
    for (const category of categories) {
      const mdPath = path.join(booksDir, category, id, 'book.md');
      const txtPath = path.join(booksDir, category, id, 'book.txt');
      try {
        let raw = null as string | null;
        try { raw = await fs.readFile(mdPath, 'utf8'); } catch (e) {}
        if (!raw) {
          try { raw = await fs.readFile(txtPath, 'utf8'); } catch (e) {}
        }
        if (!raw) continue;
        // if markdown, strip frontmatter and return text body
        const body = raw.replace(/^---[\s\S]*?---\s*/, '');
        const slice = body.slice(start, start + length);
        return new Response(JSON.stringify({ id, start, length: slice.length, text: slice }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        continue;
      }
    }
  } catch (e) {
    // ignore
  }
  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
}
