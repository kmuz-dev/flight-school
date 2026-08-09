import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Dev tooling segment. Routes under /dev exist for authoring and debugging only:
 * they are never linked from product navigation, never localised, and marked
 * noindex so a static export that ships them cannot surface them in search.
 */
export const metadata: Metadata = {
  title: "Flight School dev tools",
  robots: { index: false, follow: false },
};

export default function DevLayout({ children }: { children: ReactNode }) {
  return children;
}
