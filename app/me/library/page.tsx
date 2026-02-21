import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";
import dynamic from "next/dynamic";

const BookmarkItem = dynamic(() => import('../BookmarkItem'));

export default async function LibraryPage() {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.email) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold">My Library</h1>
        <p className="text-gray-600">Sign in to see your saved books.</p>
      </main>
    );
  }

  const user = await prisma.user.findFirst({ where: { email: session.user.email } });
  if (!user) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold">My Library</h1>
        <p className="text-gray-600">No account found.</p>
      </main>
    );
  }

  const items = await prisma.bookmark.findMany({ where: { userId: user.id }, include: { book: true }, orderBy: { createdAt: 'desc' } });

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-serif font-semibold mb-4">My Library</h1>
      {items.length === 0 ? (
        <p className="text-gray-600">You have no saved bookmarks.</p>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <BookmarkItem
              key={it.id}
              id={it.id}
              bookId={it.bookId}
              title={it.book?.title}
              author={it.book?.author}
              category={it.book?.category}
              position={it.position}
              createdAt={it.createdAt.toISOString()}
            />
          ))}
        </div>
      )}
    </main>
  );
}
