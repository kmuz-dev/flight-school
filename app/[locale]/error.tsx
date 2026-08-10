"use client";

/**
 * The screen a cadet sees when a render throws.
 *
 * Without this, a static export has nowhere to fall back to: React unmounts the
 * tree and the browser is left holding a blank white page with no way out. The
 * two things that matter here are that the way out exists (the hangar is a
 * plain link, so it works even if the router is what broke) and that the copy
 * says the true thing - progress is in localStorage, so a crash costs the
 * screen, never the folds already done.
 *
 * `reset` is React's retry: it re-renders the boundary's children. Worth
 * offering first, because the common cause is a transient one - a WebGL context
 * lost when the machine woke from sleep.
 */
import { useEffect } from "react";
import { FOCUS_RING } from "@/components/ui/focus";
import { useChromeStrings } from "@/components/ui/ChromeStrings";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // No error service to report to by design (SPEC: no backend). The console
    // is what a bug report can be copied out of.
    console.error("Flight School: screen failed to render", error);
  }, [error]);

  const strings = useChromeStrings();
  if (!strings) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-[52ch] flex-col justify-center gap-lg px-lg py-2xl">
      <span aria-hidden="true" className="flex gap-xs">
        <span className="size-[10px] rotate-45 bg-red" />
        <span className="size-[10px] rotate-45 bg-sky" />
        <span className="size-[10px] rotate-45 bg-ink" />
      </span>

      <h1 className="font-display text-h1 leading-none font-bold tracking-tight uppercase">
        {strings.errorTitle}
      </h1>
      <p className="text-instruction leading-relaxed text-ink-87">{strings.errorBody}</p>

      <div className="flex flex-wrap gap-sm">
        <button
          type="button"
          onClick={reset}
          className={`bg-red-ink px-md py-sm font-semibold text-on-red ${FOCUS_RING}`}
        >
          {strings.errorRetry}
        </button>
        <a
          href={strings.hangarHref}
          className={`border border-ink px-md py-sm font-semibold ${FOCUS_RING}`}
        >
          {strings.backToHangar}
        </a>
      </div>
    </main>
  );
}
