import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nouvelle Vie – Un emploi stable",
  description: "Accompagnement vers l'emploi stable : mental, actions, progression.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
