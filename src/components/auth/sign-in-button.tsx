"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="bg-black text-white px-4 py-2 rounded hover:opacity-80 hover:scale-105 transition"
    >
      Sign in with GitHub
    </button>
  );
}