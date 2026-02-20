const fs = require('fs').promises;
const path = require('path');

async function generateIndex() {
  const booksDir = path.join(process.cwd(), 'content', 'books');
  const outPath = path.join(process.cwd(), 'content', 'index.json');

  try {
    await fs.access(booksDir);
  } catch (e) {
    await fs.mkdir(path.join(process.cwd(), 'content'), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify([], null, 2), 'utf8');
    console.log('Wrote empty index (no books dir)');
    return;
  }

  const categories = await fs.readdir(booksDir);
  const results = [];

  for (const category of categories) {
    const categoryPath = path.join(booksDir, category);
    let stat;
    try {
      stat = await fs.stat(categoryPath);
    } catch (e) {
      continue;
    }
    if (!stat.isDirectory()) continue;

    const slugs = await fs.readdir(categoryPath);
    for (const slug of slugs) {
      const metaPath = path.join(categoryPath, slug, 'meta.json');
      try {
        const raw = await fs.readFile(metaPath, 'utf8');
        const meta = JSON.parse(raw);
        const id = meta.id || meta.slug || slug;
        const entry = {
          id: String(id),
          title: String(meta.title || id),
          author: String(meta.author || ''),
          category: String(category),
        };
        if (meta.description) entry.description = String(meta.description);
        if (meta.publishedYear !== undefined && meta.publishedYear !== null) {
          const n = Number(meta.publishedYear);
          if (!Number.isNaN(n)) entry.publishedYear = n;
        }
        if (Array.isArray(meta.tags)) entry.tags = meta.tags.map(String);
        results.push(entry);
      } catch (e) {
        // ignore
      }
    }
  }

  await fs.writeFile(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log('Wrote index with', results.length, 'entries to', outPath);
}

if (require.main === module) {
  generateIndex().catch(err => {
    console.error('generateIndex failed:', err);
    process.exit(1);
  });
}

module.exports = generateIndex;
