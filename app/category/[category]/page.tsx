import Link from "next/link";
import { getBookIndex } from "../../../lib/bookIndex";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  const index = await getBookIndex();
  const booksInCategory = index
    .filter((b) => b.category === category)
    .sort((a, b) => a.title.localeCompare(b.title));

  if (!booksInCategory.length) {
    // If category is empty or doesn't exist
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Home
        </Link>
        <h1 className="text-4xl font-bold font-serif mb-4 capitalize">{category}</h1>
        <p className="text-gray-600">No books in this category yet.</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <nav className="text-sm text-gray-600 mb-4">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="capitalize">{category}</span>
      </nav>

      <h1 className="text-4xl font-bold font-serif mb-2 capitalize">{category}</h1>
      <p className="text-gray-600 mb-6">{booksInCategory.length} {(booksInCategory.length === 1) ? 'book' : 'books'}</p>

      <div className="space-y-3">
        {booksInCategory.map((b) => (
          <div key={b.slug} className="p-3 border border-gray-200 rounded-md flex justify-between items-center">
            <div>
              <div className="font-semibold">{b.title}</div>
              <div className="text-sm text-gray-600">{b.author}</div>
            </div>
            <div>
              <Link href={b.href} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md">Read</Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
