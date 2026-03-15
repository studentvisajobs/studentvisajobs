import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI CV and Cover Letter Generator",
  description:
    "Generate tailored CVs and cover letters for visa sponsorship jobs using AI.",
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}