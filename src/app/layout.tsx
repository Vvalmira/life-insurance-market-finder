import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "MarketScope | Life Insurance Opportunity Finder",
  description:
    "Explore transparent, data-backed rankings of US states and counties for age 60+ life insurance marketing.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
