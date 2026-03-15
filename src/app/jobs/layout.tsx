import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visa Sponsorship Jobs for International Students",
  description:
    "Browse UK visa sponsorship jobs for international students and graduates. Discover sponsor companies, graduate roles, and Skilled Worker opportunities.",
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}