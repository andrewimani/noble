"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{session.user.name || session.user.email}</span>
        <button
          onClick={() => signOut()}
          className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded-md"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md"
    >
      Sign in
    </button>
  );
}
