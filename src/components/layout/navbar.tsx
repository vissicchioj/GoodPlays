"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { SignInButton } from "../auth/sign-in-button";
import { SignOutButton } from "../auth/sign-out-button";

const NAV_LINKS = [
  { href: "/", label: "Discover" },
  { href: "/library", label: "My Library" },
];

// A Client Component so it can live in the shared layout (see layout.tsx).
// useSession() reads the session from the SessionProvider in <Providers>.
export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-4 shadow sm:px-8">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4 sm:gap-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold sm:text-2xl"
        >
          {/* next/image serves the logo resized and cached, and reserves its
              space before it loads so the navbar doesn't shift. alt="" because
              the "Goodplays" text right next to it already names the link;
              screen readers would otherwise read the name twice.
              loading="eager": it's always visible at the top of the page, so
              don't wait for lazy loading. (Next 16 deprecated the old
              `priority` prop; its docs recommend eager loading for cases
              like this.) */}
          <Image
            src="/goodplays-logo.png"
            alt=""
            width={55}
            height={40}
            loading="eager"
            className="h-8 w-auto sm:h-10"
          />
          Goodplays
        </Link>

        {session && (
          <nav className="flex items-center gap-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  // Tells screen readers which page you're on; also styled below.
                  aria-current={isActive ? "page" : undefined}
                  className={`text-sm font-medium transition hover:text-black ${
                    isActive ? "text-black underline underline-offset-4" : "text-gray-600"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div>
        {status === "loading" ? (
          // While the session is being checked, show a neutral placeholder the
          // same size as the button, instead of flashing "Sign in" to someone
          // who is already signed in.
          <div
            aria-hidden="true"
            className="h-10 w-28 animate-pulse rounded bg-gray-200"
          />
        ) : session ? (
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
