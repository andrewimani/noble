import Link from "next/link";
import { getBookIndex } from "../lib/bookIndex";
import type { Book } from "../lib/types";
import SearchInput from "./components/SearchInput";

type Props = {
  searchParams?: { q?: string };
};

export default async function HomePage({ searchParams }: Props) {
  // In some Next versions `searchParams` may be a Promise; normalize it.
  const sp = await Promise.resolve(searchParams || {});
  const q = (sp?.q || "").toString();
  const index = await getBookIndex();

  const categories = Array.from(new Set(index.map((b: Book) => b.category))).sort();
  const counts: Record<string, number> = index.reduce((m, b) => {
    m[b.category] = (m[b.category] || 0) + 1;
    return m;
  }, {} as Record<string, number>);

  let results: Book[] = [];
  if (q.trim()) {
    const lower = q.toLowerCase();
    results = index.filter((b) => {
      return (
        b.title.toLowerCase().includes(lower) ||
        (b.author || '').toLowerCase().includes(lower) ||
        b.category.toLowerCase().includes(lower) ||
        (b as any).id.toLowerCase().includes(lower)
      );
    });
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold font-serif mb-6">Noble Library</h1>

      <SearchInput initialQuery={q} />

      {q.trim() ? (
        <section className="space-y-4">
          <p className="text-gray-600">Showing {results.length} result{results.length !== 1 ? 's' : ''} for "{q}"</p>
          {results.length === 0 && (
            <p className="text-gray-600">No books matched your search.</p>
          )}
          <div className="space-y-3">
            {results.map((r) => (
              <div key={(r as any).id} className="p-3 border border-gray-200 rounded-md flex justify-between items-center">
                <div>
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-sm text-gray-600">{r.author} — <span className="capitalize">{r.category}</span></div>
                </div>
                <div>
                  <Link href={`/book/${(r as any).id}`} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md">Read</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="space-y-4">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/category/${category}`}
                className="block p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <h2 className="text-xl font-semibold capitalize">{category}</h2>
                <p className="text-gray-600">{(counts[category] || 0) === 1 ? '1 book' : `${counts[category] || 0} books`}</p>
              </Link>
            ))}
          </div>

          {categories.length === 0 && (
            <p className="text-gray-600">No categories found yet.</p>
          )}
        </section>
      )}
    </main>
  );
}
