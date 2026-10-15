import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";
import { Navbar } from "../components/layout/navbar";
import { Footer } from "../components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Goodplays",
  description: "Track games, build your backlog, and share reviews.",
};

// The shared frame for every page: navbar, page content, footer.
//
// This layout deliberately doesn't read the session (cookies). Per the Next.js
// docs, if a layout reads runtime data like cookies, loading.tsx can't show
// its fallback while that layout is waiting. The Navbar gets the session on
// the client instead, through the SessionProvider in <Providers>.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* font-sans applies the Geist font loaded above. Before, globals.css
          set Arial on <body>, so Geist was downloaded but never used. */}
      <body className="flex min-h-full flex-col bg-gray-100 font-sans text-gray-900">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
