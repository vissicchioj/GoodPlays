"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="bg-red-500 text-white px-4 py-2 rounded hover:opacity-80 hover:scale-105 transition"
    >
      Sign out
    </button>
  );
}