import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neural Tutors",
  description: "Teacher Aid App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
