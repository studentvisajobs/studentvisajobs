import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import "./globals.css";


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "StudentVisaJobs",
    template: "%s | StudentVisaJobs",
  },
  description:
    "Find UK visa sponsorship jobs, discover sponsor companies, and generate tailored CVs and cover letters with AI.",
  keywords: [
    "UK visa sponsorship jobs",
    "Skilled Worker sponsorship jobs",
    "international student jobs UK",
    "UK sponsor companies",
    "graduate visa jobs UK",
    "AI CV generator",
    "AI cover letter generator",
  ],

  // ✅ FIXED DOMAIN
  metadataBase: new URL("https://studentvisajobs.com"),

  openGraph: {
    title: "StudentVisaJobs",
    description:
      "Find UK visa sponsorship jobs, discover sponsor companies, and generate tailored CVs and cover letters with AI.",
    url: "https://studentvisajobs.com",
    siteName: "StudentVisaJobs",

    // 🔥 THIS IS THE MAIN FIX FOR YOUR IMAGE
    images: [
      {
        url: "https://studentvisajobs.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],

    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "StudentVisaJobs",
    description:
      "Find UK visa sponsorship jobs, discover sponsor companies, and generate tailored CVs and cover letters with AI.",
    images: ["https://studentvisajobs.com/og-image.png"],
  },
};

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="/" className="flex items-center gap-2 sm:gap-3">
          <img src="/logo.svg" alt="StudentVisaJobs" className="h-9 w-auto sm:h-10" />
        </a>

        <div className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a className="hover:text-blue-900" href="/jobs">
            Jobs
          </a>
          <a className="hover:text-blue-900" href="/sponsors">
            Sponsors
          </a>
          <a className="hover:text-blue-900" href="/sponsors/top">
            Top Sponsors
          </a>
          <a className="hover:text-blue-900" href="/visa-hub">
            Visa Hub
          </a>
          <a className="hover:text-blue-900" href="/tools">
            Career Tools
          </a>
        </div>

        <Navbar />
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
        <div>
          <p className="font-bold text-slate-900">StudentVisaJobs</p>
          <p className="text-sm text-black/60">
            Helping international students build their future in the UK.
          </p>
        </div>

        <div className="flex gap-6 text-sm font-medium text-black/70">
          <a href="/privacy" className="hover:text-blue-900">
            Privacy
          </a>
          <a href="/terms" className="hover:text-blue-900">
            Terms
          </a>
          <a href="/contact" className="hover:text-blue-900">
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
    <html lang="en" className="bg-white">
      <body className="min-h-screen bg-white text-slate-900">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}