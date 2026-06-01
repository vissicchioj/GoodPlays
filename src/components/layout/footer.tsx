export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white px-8 py-6 text-center text-sm text-gray-500">
      <p>
        {currentYear} Goodplays. Jake Vissicchio.
      </p>
    </footer>
  );
}