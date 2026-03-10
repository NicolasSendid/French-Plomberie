import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "French Plomberie",
  description: "Urgence et dépannage plomberie 7j/7",
  manifest: "/manifest.ts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
