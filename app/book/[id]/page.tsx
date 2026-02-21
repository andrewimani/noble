import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import BookmarkButton from "../../components/BookmarkButton";

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

  const mdPath = path.join(bookDir, "book.md");
  const txtPath = path.join(bookDir, "book.txt");

  if (!bookDir || (!fs.existsSync(mdPath) && !fs.existsSync(txtPath))) {
    return (
      <main className="p-8">
        <h1>Book not found</h1>
        <p>No book exists at /book/{id}</p>
      </main>
    );
  }
  let contentHtml = '';
  let rawText = '';
  if (fs.existsSync(mdPath)) {
    const fileContent = fs.readFileSync(mdPath, "utf8");
    const { content } = matter(fileContent);
    contentHtml = marked.parse(content);
    rawText = content;
  } else {
    // fallback to plain text
    rawText = fs.readFileSync(txtPath, 'utf8');
    // convert simple plaintext to paragraphs
    contentHtml = rawText
      .split(/\n\r?\n/)
      .map(p => `<p>${String(p).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}</p>`)
      .join('\n');
  }

  const title = (() => {
    try {
      const metaPath = path.join(bookDir, 'meta.json');
      if (fs.existsSync(metaPath)) {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        return meta.title || id;
      }
    } catch (e) {}
    return id;
  })();

  return (
    <main>
      <div className="p-8 max-w-2xl mx-auto">
        {/* Breadcrumb: Home / Category / Title */}
        <nav className="text-sm text-gray-600 mb-4">
          <a href="/" className="text-blue-600 hover:underline">Home</a>
          <span className="mx-2">/</span>
          <a href={`/category/${path.basename(path.dirname(bookDir))}`} className="text-blue-600 hover:underline capitalize">{path.basename(path.dirname(bookDir))}</a>
          <span className="mx-2">/</span>
          <span className="font-semibold">{title}</span>
        </nav>

        <div className="mb-4">
          <BookmarkButton bookId={id} textLength={rawText.length} />
        </div>

        <div className="reader" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>
    </main>
  );
}
