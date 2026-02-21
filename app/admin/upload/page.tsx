import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import React from "react";

export default async function UploadPage() {
  const session = await getServerSession(authOptions as any);
  const allowedAdmins = ["andrewimani"];
  const isAdmin = !!(session && session.user && session.user.name && allowedAdmins.includes(String(session.user.name)));

  if (!isAdmin) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold">Admin upload</h1>
        <p className="text-gray-600">You must be signed in as an admin to upload books.</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-serif font-semibold mb-4">Upload book</h1>
      <p className="text-gray-600 mb-4">Upload a <code>meta.json</code> and either a <code>book.md</code> or <code>book.txt</code>.</p>
      <form method="post" action="/api/admin/import" encType="multipart/form-data">
        <div className="mb-4">
          <label className="block mb-1">meta.json</label>
          <input name="meta" type="file" accept="application/json" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1">book.md or book.txt</label>
          <input name="book" type="file" accept="text/markdown,text/plain" required />
        </div>
        <div>
          <button className="px-3 py-1 bg-blue-600 text-white rounded-md">Upload</button>
        </div>
      </form>
    </main>
  );
}
