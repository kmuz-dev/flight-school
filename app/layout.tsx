import type { Metadata } from "next";
import { Archivo_Narrow, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-archivo-narrow",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://flight-school-chi.vercel.app",
  ),
  title: "Flight School",
  description: "A flight academy for paper. Learn to fold paper airplanes step by step in 3D.",
  applicationName: "Flight School",
  openGraph: {
    title: "Flight School",
    description: "A flight academy for paper. Fold a plane, earn its wings, and fly it.",
    siteName: "Flight School",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flight School",
    description: "A flight academy for paper. Fold a plane, earn its wings, and fly it.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivoNarrow.variable} ${instrumentSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
