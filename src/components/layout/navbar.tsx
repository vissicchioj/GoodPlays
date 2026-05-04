import { Session } from "next-auth";

import { SignInButton } from "../../components/auth/sign-in-button";
import { SignOutButton } from "../../components/auth/sign-out-button";

type NavbarProps = {
  session: Session | null;
};

export function Navbar({ session }: NavbarProps) {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-8">
        <a href="/" className="text-2xl font-bold">
          🎮 Goodplays
        </a>

        {session && (
          <nav className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-black transition"
            >
              Discover
            </a>

            <a
              href="/library"
              className="text-sm font-medium text-gray-600 hover:text-black transition"
            >
              My Library
            </a>
          </nav>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div>
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
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