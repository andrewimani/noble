"use client";

import React from "react";
import { useSession } from "next-auth/react";

export default function BookmarkButton({ bookId, textLength }: { bookId: string; textLength: number }) {
  const { data: session } = useSession();
  const [status, setStatus] = React.useState<"idle"|"saving"|"saved"|"error">("idle");

  async function saveBookmark() {
    if (!session?.user) {
      window.alert('Please sign in to save bookmarks.');
      return;
    }
    setStatus('saving');
    try {
      const ratio = Math.max(0, Math.min(1, window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)));
      const pos = Math.floor(ratio * Math.max(1, textLength));
      const res = await fetch('/api/me/bookmarks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ bookId, position: pos }),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (e) {
      console.error(e);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  }

  return (
    <div>
      <button onClick={saveBookmark} className="px-3 py-1 bg-gray-200 rounded-md text-sm">
        {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : status === 'error' ? 'Error' : 'Save bookmark'}
      </button>
    </div>
  );
}
