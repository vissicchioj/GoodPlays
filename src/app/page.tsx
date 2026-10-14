import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { GameSearch } from "../components/games/game-search";
import { Navbar } from "../components/layout/navbar";
import { Footer } from "../components/layout/footer";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      {/* HEADER */}
      <Navbar session={session} />

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-semibold">Track your games</h2>
          <p className="text-gray-600">
            Search for a game and add it to your backlog.
          </p>
        </div>

        {/* SEARCH */}
        <GameSearch />
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
