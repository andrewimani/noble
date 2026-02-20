import React from "react";

export const dynamic = "force-dynamic";

export default function AdminImportPage() {
  return (
    <html>
      <head>
        <title>Import book</title>
      </head>
      <body>
        <main style={{maxWidth: 720, margin: "3rem auto", padding: "0 1rem"}}>
          <h1 style={{fontFamily: "serif", fontSize: "1.75rem"}}>Import book</h1>
          <p>Upload a <code>meta.json</code> file and the corresponding <code>book.md</code>.</p>

          <form method="post" action="/api/admin/import" encType="multipart/form-data">
            <div style={{margin: "1rem 0"}}>
              <label style={{display: "block", marginBottom: 6}}>meta.json</label>
              <input name="meta" type="file" accept="application/json" required />
            </div>
            <div style={{margin: "1rem 0"}}>
              <label style={{display: "block", marginBottom: 6}}>book.md</label>
              <input name="book" type="file" accept="text/markdown,text/plain" required />
            </div>

            <div style={{marginTop: 12}}>
              <button type="submit" style={{padding: "8px 12px"}}>Import</button>
            </div>
          </form>

          <p style={{marginTop: 18}}>
            Note: this is a server-side import endpoint. Files will be written into <code>content/books/&lt;category&gt;/&lt;slug&gt;/</code>.
          </p>
        </main>
      </body>
    </html>
  );
}
