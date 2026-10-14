import Link from "next/link";
import { Session } from "next-auth";

import { SignInButton } from "../../components/auth/sign-in-button";
import { SignOutButton } from "../../components/auth/sign-out-button";

type NavbarProps = {
  session: Session | null;
};

// <Link> instead of <a>: Next.js swaps in just the new page instead of making
// the browser reload everything (JavaScript, styles, session) from scratch.
export function Navbar({ session }: NavbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-4 shadow sm:px-8">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4 sm:gap-8">
        <Link href="/" className="text-xl font-bold sm:text-2xl">
          🎮 Goodplays
        </Link>

        {session && (
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              Discover
            </Link>

            <Link
              href="/library"
              className="text-sm font-medium text-gray-600 transition hover:text-black"
            >
              My Library
            </Link>
          </nav>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div>
        {session ? (
          <div className="flex items-center gap-4">
            {/* Hidden on very small screens so the header fits on one line */}
            <span className="hidden text-sm text-gray-600 sm:inline">
              {session.user?.name ?? "User"}
            </span>

            <SignOutButton />
          </div>
        ) : (
          <SignInButton />
        )}
      </div>
    </header>
  );
}
