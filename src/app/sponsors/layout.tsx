import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UK Sponsor Companies Hiring International Students",
  description:
    "Explore UK sponsor companies licensed to hire international workers and offering Skilled Worker visa sponsorship jobs.",
};

export default function SponsorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}