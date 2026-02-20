"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  initialQuery?: string;
};

export default function SearchInput({ initialQuery = "" }: Props) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      const url = new URL(window.location.href);
      if (value) url.searchParams.set('q', value); else url.searchParams.delete('q');
      // navigate without adding history entry
      router.replace(url.toString());
    }, 250);
    return () => clearTimeout(t);
  }, [value, router]);

  return (
    <form method="get" className="mb-6" >
      <input
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search books by title, author, category, or slug"
        className="w-full p-3 border border-gray-300 rounded-md"
        autoComplete="off"
        aria-label="Search books"
      />
    </form>
  );
}
