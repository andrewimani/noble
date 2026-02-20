import fs from "fs/promises";
import path from "path";

function slugify(input: unknown) {
  if (!input) return "";
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function htmlResponse(message: string, code = 400) {
  const body = `<!doctype html><html><head><meta charset="utf-8"><title>Import result</title></head><body><main style="max-width:720px;margin:3rem auto;padding:0 1rem;font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif"><h1>Import error</h1><p>${message}</p><p><a href="/admin/import">Back to import</a></p></main></body></html>`;
  return new Response(body, {status: code, headers: {"Content-Type": "text/html; charset=utf-8"}});
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const metaFile = form.get("meta") as File | null;
    const bookFile = form.get("book") as File | null;

    if (!metaFile || !bookFile) {
      return htmlResponse("Both meta.json and book.md must be uploaded.");
    }

    const metaText = await metaFile.text();
    let meta;
    try {
      meta = JSON.parse(metaText);
    } catch (err) {
      return htmlResponse("meta.json is not valid JSON.");
    }

    const {title, author, category, slug} = meta || {};
    if (!title || !author || !category || !slug) {
      return htmlResponse("meta.json must include title, author, category, and slug fields.");
    }

    const categorySlug = slugify(category);
    const bookSlug = String(slug).trim();
    if (!bookSlug) return htmlResponse("Invalid slug in meta.json.");

    const baseDir = path.join(process.cwd(), "content", "books", categorySlug);
    const bookDir = path.join(baseDir, bookSlug);

    // Ensure category folder exists (create if needed)
    await fs.mkdir(baseDir, {recursive: true});

    // If book folder already exists, do not overwrite
    try {
      const stat = await fs.stat(bookDir);
      if (stat && stat.isDirectory()) {
        return htmlResponse(`Book already exists at content/books/${categorySlug}/${bookSlug}. Aborting to avoid overwrite.`);
      }
    } catch (e) {
      // stat failed -> directory doesn't exist, continue
    }

    // Create book directory
    await fs.mkdir(bookDir, {recursive: true});

    // Save files
    const metaPath = path.join(bookDir, "meta.json");
    const bookPath = path.join(bookDir, "book.md");

    await fs.writeFile(metaPath, metaText, "utf8");
    const bookText = await bookFile.text();
    await fs.writeFile(bookPath, bookText, "utf8");

    // Redirect to the book page (use absolute header-compatible redirect)
    return new Response(null, {status: 303, headers: {Location: `/book/${bookSlug}`}});
  } catch (err: any) {
    console.error("Import error:", err);
    return htmlResponse("An unexpected error occurred while importing.", 500);
  }
}
