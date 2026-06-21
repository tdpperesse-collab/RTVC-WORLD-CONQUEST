import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RTVC Koumé — Plateforme OTT chrétienne",
  description:
    "RTVC Koumé : diffusez et regardez les cultes, enseignements, témoignages et musiques de la Communauté Missionnaire Chrétienne Internationale. Streaming live et vidéo à la demande.",
  keywords: [
    "RTVC Koumé",
    "plateforme chrétienne",
    "streaming live",
    "culte en direct",
    "enseignement biblique",
    "Cameroun",
    "Ngaoundéré",
  ],
  authors: [{ name: "RTVC Koumé" }],
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "RTVC Koumé — Plateforme OTT chrétienne",
    description:
      "Streaming live et vidéo à la demande de la Communauté Missionnaire Chrétienne Internationale.",
    siteName: "RTVC Koumé",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
