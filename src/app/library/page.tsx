import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../lib/auth";
import { Navbar } from "../../components/layout/navbar";
import { Footer } from "../../components/layout/footer";
import { LibraryClient } from "../../components/library/library-client";
import { getUserLibrary } from "../../server/queries/get-user-library";
import { getUserTags } from "../../server/queries/get-user-tags";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  // The two queries don't depend on each other, so run them at the same time.
  const [library, tags] = await Promise.all([
    getUserLibrary(session.user.id),
    getUserTags(session.user.id),
  ]);

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar session={session} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-semibold">My Library</h2>
          <p className="text-gray-600">
            Manage your backlog, currently playing games, completed games, and
            dropped games.
          </p>
        </div>

        <LibraryClient library={library} allTags={tags} />
      </div>

      <Footer />
    </main>
  );
}
