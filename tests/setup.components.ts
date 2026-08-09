/**
 * Setup for the jsdom `components` project only.
 *
 * Testing Library registers its own afterEach cleanup only when the runner
 * exposes `afterEach` as a global, and this project deliberately does not
 * (`globals` is off, tests import from vitest). Without this, every render in a
 * file stays mounted for the rest of the file: queries then match several
 * copies of the same control, and a test can pass against a stale render from
 * an earlier case. Registering it once here is the difference between component
 * tests that mean something and component tests that merely run.
 */
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
