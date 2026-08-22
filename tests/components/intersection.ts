/**
 * A controllable `IntersectionObserver`, for the three screens that suspend a
 * 3D stage when it scrolls out of view.
 *
 * jsdom has no layout and therefore no real observer, so the only way to test
 * the behaviour is to hold the callback and fire it. One helper rather than one
 * mock per suite: the three screens share `useRenderActivity`, and a test that
 * drove it differently in each place would stop being evidence that they agree.
 */
import { vi } from "vitest";

export type StageObserver = {
  /** Report the observed element entering or leaving the viewport. */
  readonly notify: (isIntersecting: boolean) => void;
  /** True once anything has actually been observed. */
  readonly observing: () => boolean;
  readonly restore: () => void;
};

/**
 * Install the mock. `matches` picks which observed element this handle drives,
 * so a screen that observes more than one thing cannot silently be answered by
 * the wrong one.
 */
export function stubIntersectionObserver(
  matches: (target: Element) => boolean = () => true,
): StageObserver {
  let fire: ((isIntersecting: boolean) => void) | null = null;

  class IntersectionObserverMock {
    readonly root = null;
    readonly rootMargin = "0px";
    readonly thresholds = [0];

    constructor(private readonly callback: IntersectionObserverCallback) {}

    observe(target: Element): void {
      if (!matches(target)) return;
      fire = (isIntersecting) =>
        this.callback(
          [{ isIntersecting, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
    }
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

  return {
    notify: (isIntersecting) => fire?.(isIntersecting),
    observing: () => fire !== null,
    restore: () => vi.unstubAllGlobals(),
  };
}
