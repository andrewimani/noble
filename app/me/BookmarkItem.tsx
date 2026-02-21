"use client";

import React from "react";
import Link from "next/link";

export default function BookmarkItem(props: {
  id: string;
  bookId: string;
  title?: string | null;
  author?: string | null;
  category?: string | null;
  position: number;
  createdAt: string;
}) {
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!confirm('Delete this bookmark?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/me/bookmarks/${props.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      // simple reload to refresh server-rendered list
      window.location.reload();
    } catch (e) {
      console.error(e);
      setDeleting(false);
      alert('Failed to delete bookmark');
    }
  }

  return (
    <div className="p-3 border border-gray-200 rounded-md flex justify-between items-center">
      <div>
        <div className="font-semibold">{props.title || props.bookId}</div>
        <div className="text-sm text-gray-600">{props.author} — {props.category}</div>
        <div className="text-xs text-gray-500 mt-1">Saved {new Date(props.createdAt).toLocaleString()}</div>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/book/${props.bookId}?pos=${props.position}`} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md">Resume</Link>
        <button onClick={handleDelete} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-md">{deleting ? 'Deleting...' : 'Delete'}</button>
      </div>
    </div>
  );
}
