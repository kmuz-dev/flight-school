"use client";

/**
 * The handful of strings a screen needs when it has no props left to receive
 * them through.
 *
 * `error.tsx` is the whole reason this exists. React error boundaries take no
 * props, they must be client components, and the locale dictionaries are a
 * server-side registry: importing `getUi` from a client component would send
 * all twelve dictionaries, half a megabyte of fold prose, to every browser to
 * render three lines of apology. The locale layout is a server component that
 * already knows the locale, and the boundary renders inside it, so passing the
 * strings down as context costs the three strings themselves and nothing else.
 */
import { createContext, useContext } from "react";

export type ChromeStrings = {
  readonly errorTitle: string;
  readonly errorBody: string;
  readonly errorRetry: string;
  readonly backToHangar: string;
  readonly hangarHref: string;
};

const ChromeStringsContext = createContext<ChromeStrings | null>(null);

export function ChromeStringsProvider({
  value,
  children,
}: {
  value: ChromeStrings;
  children: React.ReactNode;
}) {
  return <ChromeStringsContext value={value}>{children}</ChromeStringsContext>;
}

/** Null only if something renders outside the locale layout, which nothing does. */
export function useChromeStrings(): ChromeStrings | null {
  return useContext(ChromeStringsContext);
}
