const fs = require('fs');
const path = require('path');

function validate() {
  const p = path.join(process.cwd(), 'content', 'index.json');
  if (!fs.existsSync(p)) {
    console.error('index.json missing');
    process.exit(2);
  }
  const raw = fs.readFileSync(p, 'utf8');
  let idx;
  try { idx = JSON.parse(raw); } catch (e) { console.error('invalid json'); process.exit(2); }
  if (!Array.isArray(idx)) { console.error('index is not an array'); process.exit(2); }

  const allowed = new Set(['id','title','author','category','description','publishedYear','tags']);
  let ok = true;
  idx.forEach((o,i) => {
    ['id','title','author','category'].forEach(k => { if (!(k in o)) { console.error('missing',k,'in entry',i); ok = false; } });
    Object.keys(o).forEach(k => { if (!allowed.has(k)) { console.error('unexpected field',k,'in entry',i); ok = false; } });
    if (o.tags && !Array.isArray(o.tags)) { console.error('tags must be array in entry',i); ok = false; }
    if (o.publishedYear !== undefined && typeof o.publishedYear !== 'number') { console.error('publishedYear must be number in entry',i); ok = false; }
  });

  console.log('validIndex:', ok, 'count:', idx.length);
  if (!ok) process.exit(3);
}

validate();
