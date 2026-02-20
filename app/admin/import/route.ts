import { NextRequest } from "next/server";

function renderFormHtml(secret?: string) {
  const action = secret ? `/api/admin/import?key=${encodeURIComponent(secret)}` : "/api/admin/import";
  return `<!doctype html><html><head><meta charset="utf-8"><title>Import book</title></head><body><main style="max-width:720px;margin:3rem auto;padding:0 1rem;font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif"><h1 style="font-family:serif;font-size:1.75rem">Import book</h1><p>Upload a <code>meta.json</code> file and the corresponding <code>book.md</code>.</p><form method="post" action="${action}" encType="multipart/form-data"><div style="margin:1rem 0"><label style="display:block;margin-bottom:6px">meta.json</label><input name="meta" type="file" accept="application/json" required/></div><div style="margin:1rem 0"><label style="display:block;margin-bottom:6px">book.md</label><input name="book" type="file" accept="text/markdown,text/plain" required/></div><div style="margin-top:12px"><button type="submit" style="padding:8px 12px">Import</button></div></form><p style="margin-top:18px">Note: this is a server-side import endpoint. Files will be written into <code>content/books/&lt;category&gt;/&lt;slug&gt;/</code>.</p></main></body></html>`;
}

export async function GET(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET || "";
  const url = new URL(req.url);
  const keyQuery = url.searchParams.get("key");
  const keyHeader = req.headers.get("x-admin-key");

  const authorized = secret && (keyQuery === secret || keyHeader === secret);
  if (!authorized) {
    return new Response("Unauthorized", {status: 401});
  }

  return new Response(renderFormHtml(secret), {status: 200, headers: {"Content-Type": "text/html; charset=utf-8"}});
}
