import fs from "fs/promises";
import path from "path";
import generateIndex from '../../../../lib/generateIndex';
import { Book } from '../../../../lib/types';
import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

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
  // protect by ADMIN_SECRET OR signed-in admin user
  const secret = process.env.ADMIN_SECRET || "";
  const url = new URL(req.url);
  const keyQuery = url.searchParams.get("key");
  const keyHeader = req.headers.get("x-admin-key");

  let authorized = false;
  if (secret && (keyQuery === secret || keyHeader === secret)) authorized = true;

  if (!authorized) {
    try {
      const session = await getServerSession(authOptions as any);
      const allowedAdmins = ["andrewimani"];
      if (session && session.user && session.user.name && allowedAdmins.includes(String(session.user.name))) {
        authorized = true;
      }
    } catch (e) {
      // ignore
    }
  }

  if (!authorized) {
    return new Response("Unauthorized", {status: 401});
  }
  try {
    const form = await req.formData();
    const metaFile = form.get("meta") as File | null;
    const bookFile = form.get("book") as File | null;

    if (!metaFile || !bookFile) {
      return htmlResponse("Both meta.json and book.md must be uploaded.");
    }

    const metaText = await metaFile.text();
    let rawMeta: any;
    try {
      rawMeta = JSON.parse(metaText);
    } catch (err) {
      return htmlResponse("meta.json is not valid JSON.");
    }

    // Normalize and validate against `Book` shape.
    const maybeId = rawMeta.id || rawMeta.slug || rawMeta.name;
    const idRaw = String(maybeId || '').trim();
    const id = slugify(idRaw) || '';
    const title = rawMeta.title ? String(rawMeta.title).trim() : '';
    const author = rawMeta.author ? String(rawMeta.author).trim() : '';
    const category = rawMeta.category ? String(rawMeta.category).trim() : '';
    if (!id || !title || !author || !category) {
      return htmlResponse("meta.json must include id (or slug), title, author, and category fields.");
    }

    // Optional fields
    const description = rawMeta.description ? String(rawMeta.description) : undefined;
    let publishedYear: number | undefined = undefined;
    if (rawMeta.publishedYear !== undefined && rawMeta.publishedYear !== null) {
      const n = Number(rawMeta.publishedYear);
      if (Number.isNaN(n)) return htmlResponse("publishedYear must be a number if provided.");
      publishedYear = n;
    }
    let tags: string[] | undefined = undefined;
    if (rawMeta.tags !== undefined && rawMeta.tags !== null) {
      if (!Array.isArray(rawMeta.tags)) return htmlResponse("tags must be an array of strings if provided.");
      tags = rawMeta.tags.map((t: any) => String(t));
    }

    const categorySlug = slugify(category);
    const bookSlug = id;

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

    // Save normalized meta.json and book.md
    const metaPath = path.join(bookDir, "meta.json");
    const bookPath = path.join(bookDir, "book.md");

    const normalizedMeta: Book & { slug?: string } = {
      id: bookSlug,
      title,
      author,
      category,
    };
    if (description) normalizedMeta.description = description;
    if (publishedYear !== undefined) normalizedMeta.publishedYear = publishedYear;
    if (tags) normalizedMeta.tags = tags;
    // keep slug for older compatibility
    (normalizedMeta as any).slug = bookSlug;

    await fs.writeFile(metaPath, JSON.stringify(normalizedMeta, null, 2), "utf8");
    const bookText = await bookFile.text();
    await fs.writeFile(bookPath, bookText, "utf8");

    // Create or update DB record for the book
    try {
      await prisma.book.upsert({
        where: { id: bookSlug },
        update: { title, author, category, slug: bookSlug, source: 'admin-import' },
        create: { id: bookSlug, title, author, category, slug: bookSlug, source: 'admin-import' },
      });
    } catch (e) {
      console.error('Failed to upsert book into DB:', e);
    }

    // Regenerate the precomputed index so search reads the new book.
    try {
      await generateIndex();
    } catch (e) {
      console.error('Failed to regenerate index after import:', e);
    }

    // Redirect to the book page (use absolute header-compatible redirect)
    return new Response(null, {status: 303, headers: {Location: `/book/${bookSlug}`}});
  } catch (err: any) {
    console.error("Import error:", err);
    return htmlResponse("An unexpected error occurred while importing.", 500);
  }
}
