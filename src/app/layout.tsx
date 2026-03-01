import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudentVisaJobs",
  description: "UK career platform for international students",
};

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-black" />
          <span className="text-lg font-bold tracking-tight">
            StudentVisaJobs
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a className="hover:text-black/70" href="/jobs">
            Jobs
          </a>
          <a className="hover:text-black/70" href="/employers">
            Employers
          </a>
          <a className="hover:text-black/70" href="/visa-hub">
            Visa Hub
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden sm:inline text-sm font-medium hover:text-black/70"
          >
            auth
          </a>
          <a
            href="#"
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            employer
          </a>
        </div>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-bold">StudentVisaJobs</p>
          <p className="text-sm text-black/60">
            Helping international students build their future in the UK.
          </p>
        </div>
        <div className="flex gap-6 text-sm font-medium text-black/70">
          <a href="#" className="hover:text-black/70">
            Privacy
          </a>
          <a href="#" className="hover:text-black/70">
            Terms
          </a>
          <a href="#" className="hover:text-black/70">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}