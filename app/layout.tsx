import type { Metadata } from "next";
import { Archivo_Narrow, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { THEME_BOOT_SCRIPT } from "@/lib/storage";
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
  title: "Flight School",
  description: "A flight academy for paper. Learn to fold paper airplanes step by step in 3D.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivoNarrow.variable} ${instrumentSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* First thing in the body so Night Flight is on before anything paints. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
