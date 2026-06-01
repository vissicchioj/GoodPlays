import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { SignInButton } from "../components/auth/sign-in-button";
import { SignOutButton } from "../components/auth/sign-out-button";
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
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold mb-2">
            Track your games
          </h2>
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