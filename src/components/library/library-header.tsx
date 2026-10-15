// Used by both the Library page and its loading state, so the heading stays
// in exactly the same place when the real content replaces the skeleton.
export function LibraryHeader() {
  return (
    <div className="mb-8 text-center">
      <h2 className="mb-2 text-3xl font-semibold">My Library</h2>
      <p className="text-gray-600">
        Manage your backlog, currently playing games, completed games, and
        dropped games.
      </p>
    </div>
  );
}
