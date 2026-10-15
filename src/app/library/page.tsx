import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "../../lib/auth";
import { LibraryClient } from "../../components/library/library-client";
import { LibraryHeader } from "../../components/library/library-header";
import { getUserLibrary } from "../../server/queries/get-user-library";
import { getUserTags } from "../../server/queries/get-user-tags";

// While this async page is waiting for the session and database, Next.js shows
// ./loading.tsx in its place. If anything here throws (say, the database is
// unreachable), ../error.tsx is shown instead.
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <LibraryHeader />
      <LibraryClient library={library} allTags={tags} />
    </div>
  );
}
