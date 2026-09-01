import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instant Mechanic | Operations Dashboard",
  description:
    "Live vehicle service operations dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}