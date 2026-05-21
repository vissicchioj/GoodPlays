import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../lib/auth";
import { Navbar } from "../../components/layout/navbar";
import { LibraryClient } from "../../components/library/library-client";
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

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-semibold">My Library</h2>
          <p className="text-gray-600">
            Manage your backlog, currently playing games, completed games, and dropped games.
          </p>
        </div>

        <LibraryClient library={library} />
      </div>
    </main>
  );
}