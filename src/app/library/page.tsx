import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "../../components/layout/navbar";
import { LibraryGameCard } from "../../components/library/library-game-card";

import { getUserLibrary } from "../../server/queries/get-user-library";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const library = await getUserLibrary(session.user.id);

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar session={session} />

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-semibold">My Library</h2>
          <p className="text-gray-600">
            Manage your backlog, currently playing games, and completed games.
          </p>
        </div>

        {library.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-600">Your library is empty.</p>
            <a
              href="/"
              className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:scale-105 hover:opacity-80"
            >
              Discover games
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {library.map((entry) => (
              <LibraryGameCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}