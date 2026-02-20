import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookPage({ params }: Props) {
  const { id } = await params;

  // Search for the book across all categories
  const booksDir = path.join(process.cwd(), "content", "books");
  const categories = fs.readdirSync(booksDir);
  
  let bookDir = "";
  for (const category of categories) {
    const categoryPath = path.join(booksDir, category);
    const bookPath = path.join(categoryPath, id);
    if (fs.existsSync(bookPath) && fs.statSync(bookPath).isDirectory()) {
      bookDir = bookPath;
      break;
    }
  }

  const filePath = path.join(bookDir, "book.md");

  if (!bookDir || !fs.existsSync(filePath)) {
    return (
      <main className="p-8">
        <h1>Book not found</h1>
        <p>No book exists at /book/{id}</p>
      </main>
    );
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const { content } = matter(fileContent);
  const contentHtml = marked.parse(content);

  return (
    <main>
      <div className="p-8 max-w-2xl mx-auto">
        {/* Breadcrumb: Home / Category / Title */}
        <nav className="text-sm text-gray-600 mb-4">
          <a href="/" className="text-blue-600 hover:underline">Home</a>
          <span className="mx-2">/</span>
          <a href={`/category/${path.basename(path.dirname(bookDir))}`} className="text-blue-600 hover:underline capitalize">{path.basename(path.dirname(bookDir))}</a>
          <span className="mx-2">/</span>
          <span className="font-semibold">{(() => {
            try {
              const metaPath = path.join(bookDir, 'meta.json');
              if (fs.existsSync(metaPath)) {
                const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
                return meta.title || id;
              }
            } catch (e) {}
            return id;
          })()}</span>
        </nav>

        <div className="reader" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>
    </main>
  );
}
