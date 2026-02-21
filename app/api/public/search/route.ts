import { NextRequest } from 'next/server';
import { getBookIndex } from '../../../../lib/bookIndex';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').toString().trim().toLowerCase();
  const index = await getBookIndex();
  let results = index;
  if (q) {
    results = index.filter(b => (b.title || '').toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q) || (b.category || '').toLowerCase().includes(q) || (b.id || '').toLowerCase().includes(q));
  }

  const out = results.map(b => ({ id: b.id, title: b.title, author: b.author, category: b.category, slug: (b as any).slug || b.id }));
  return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
