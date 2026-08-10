/**
 * Night Flight: the parts that can break silently.
 *
 * The precedence rule is pure and cheap to pin. The pre-paint boot script is
 * not: it is a string of JavaScript that no compiler checks, reading a schema
 * defined in TypeScript a few lines above it, and if it ever stops agreeing
 * with `Stored` the only symptom is a cream flash on the first paint of every
 * page - the kind of defect that survives a whole test suite. So it is executed
 * here against real localStorage rather than read.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NIGHT_CLASS, THEME_BOOT_SCRIPT } from "@/lib/storage";
import { resolveTheme } from "@/lib/theme";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { __resetProgressCache } from "@/lib/progress";

const KEY = "flightschool.v1";

/** Runs the shipped string exactly as the browser will, rather than reading it. */
function boot(): void {
  new Function(THEME_BOOT_SCRIPT)();
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.classList.remove(NIGHT_CLASS);
  __resetProgressCache();
});

describe("resolveTheme", () => {
  it("lets the cadet's choice beat the operating system's", () => {
    expect(resolveTheme({ progress: {}, completed: {}, theme: "paper" }, true)).toBe("paper");
    expect(resolveTheme({ progress: {}, completed: {}, theme: "night" }, false)).toBe("night");
  });

  it("follows the operating system until they choose", () => {
    expect(resolveTheme({ progress: {}, completed: {} }, true)).toBe("night");
    expect(resolveTheme({ progress: {}, completed: {} }, false)).toBe("paper");
  });
});

describe("THEME_BOOT_SCRIPT", () => {
  it("reads the stored theme and sets the class before anything renders", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ progress: {}, completed: {}, theme: "night" }));
    boot();
    expect(document.documentElement.classList.contains(NIGHT_CLASS)).toBe(true);
  });

  it("leaves the page in day flight when that is the stored choice", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ progress: {}, completed: {}, theme: "paper" }));
    boot();
    expect(document.documentElement.classList.contains(NIGHT_CLASS)).toBe(false);
  });

  it("survives junk in the key rather than throwing before the page loads", () => {
    window.localStorage.setItem(KEY, "not json {{");
    expect(boot).not.toThrow();
    expect(document.documentElement.classList.contains(NIGHT_CLASS)).toBe(false);
  });
});

describe("ThemeToggle", () => {
  const labels = {
    dayLabel: "Day flight",
    nightLabel: "Night flight",
    a11yLabel: "Switch between day and night flight",
  };

  it("switches the scene, names the one it is in, and remembers the choice", () => {
    render(<ThemeToggle {...labels} />);
    const button = screen.getByTestId("theme-toggle");

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveTextContent("Day flight");

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("Night flight");
    expect(document.documentElement.classList.contains(NIGHT_CLASS)).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(KEY) ?? "{}").theme).toBe("night");

    fireEvent.click(button);

    expect(document.documentElement.classList.contains(NIGHT_CLASS)).toBe(false);
    expect(JSON.parse(window.localStorage.getItem(KEY) ?? "{}").theme).toBe("paper");
  });

  it("starts in the scene the cadet last chose", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ progress: {}, completed: {}, theme: "night" }));
    __resetProgressCache();
    render(<ThemeToggle {...labels} />);
    expect(screen.getByTestId("theme-toggle")).toHaveAttribute("aria-pressed", "true");
  });
});
