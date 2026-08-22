"use client";

/**
 * Suspend a 3D stage that nobody is looking at.
 *
 * PRD acceptance criterion 8: "the renderer pauses while its stage is offscreen
 * or the document is hidden and resumes without creating duplicate animation
 * loops". A hidden document is free - the browser stops serving
 * `requestAnimationFrame` - but a stage scrolled out of view is not, and every
 * one of ours keeps drawing an idle float sixty times a second while it sits
 * there. On Preflight, whose art panel is one screen tall on a phone, that is a
 * full-quality WebGL stage rendering into a canvas nobody can see for as long
 * as the cadet reads the flight profile beneath it.
 *
 * This lives here rather than in the engine because it is a fact about the
 * DOCUMENT the stage is mounted in, which the engine deliberately does not
 * know: it holds a container, not a scroll position. It lives in one module
 * rather than three because the three screens must answer the question the same
 * way - a stage that resumed differently on the Hangar than on the Tutorial
 * would be a bug nobody could see until a battery ran down.
 */
import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { FoldEngineHandle } from "@/engine/core/types";

/**
 * Watch `targetRef` and drive `engineRef`'s frame loop from what it sees.
 *
 * Returns the sync function. Call it whenever the engine behind `engineRef`
 * changes, so a stage created while its container is already offscreen starts
 * suspended rather than waiting for the observer's first move.
 */
export function useRenderActivity(
  targetRef: RefObject<HTMLElement | null>,
  engineRef: RefObject<FoldEngineHandle | null>,
): () => void {
  // Both default to "visible": a machine without IntersectionObserver must draw
  // rather than sit frozen, and a document is showing until it says otherwise.
  const intersectsRef = useRef(true);
  const documentVisibleRef = useRef(true);

  const sync = useCallback(() => {
    engineRef.current?.setRenderActive(intersectsRef.current && documentVisibleRef.current);
  }, [engineRef]);

  useEffect(() => {
    const target = targetRef.current;
    const doc = target?.ownerDocument;
    if (!target || !doc) return;

    documentVisibleRef.current = !doc.hidden;
    const onVisibilityChange = (): void => {
      documentVisibleRef.current = !doc.hidden;
      sync();
    };
    doc.addEventListener("visibilitychange", onVisibilityChange);

    const Observer = doc.defaultView?.IntersectionObserver;
    const observer =
      typeof Observer === "function"
        ? new Observer((entries) => {
            const entry = entries[0];
            if (!entry) return;
            intersectsRef.current = entry.isIntersecting;
            sync();
          })
        : null;
    observer?.observe(target);

    return () => {
      observer?.disconnect();
      doc.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [targetRef, sync]);

  return sync;
}
