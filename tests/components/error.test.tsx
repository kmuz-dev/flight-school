/**
 * The error boundary. Small surface, but every part of it is load-bearing on a
 * static export: there is no server to re-render the page, so if this screen is
 * wrong the cadet's only remaining move is the back button.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import LocaleError from "@/[locale]/error";
import { ChromeStringsProvider, type ChromeStrings } from "@/components/ui/ChromeStrings";
import { getUi } from "@/i18n/dictionary";

const ar = getUi("ar");
const STRINGS: ChromeStrings = {
  errorTitle: ar["error.title"]!,
  errorBody: ar["error.body"]!,
  errorRetry: ar["error.retry"]!,
  backToHangar: ar["nav.backToHangar"]!,
  hangarHref: "/ar/",
};

function renderBoundary(reset = vi.fn()) {
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(
    <ChromeStringsProvider value={STRINGS}>
      <LocaleError error={new Error("the stage exploded")} reset={reset} />
    </ChromeStringsProvider>,
  );
  return { reset };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("the error screen", () => {
  it("apologises in the cadet's own language", () => {
    renderBoundary();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(STRINGS.errorTitle);
    expect(screen.getByText(STRINGS.errorBody)).toBeInTheDocument();
  });

  it("offers React's retry before anything else", () => {
    const { reset } = renderBoundary();
    fireEvent.click(screen.getByRole("button", { name: STRINGS.errorRetry }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("escapes with a plain link, which works even if the router is what broke", () => {
    renderBoundary();
    const escape = screen.getByRole("link", { name: STRINGS.backToHangar });
    expect(escape).toHaveAttribute("href", "/ar/");
  });

  it("writes the failure to the console, the only bug report there is", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ChromeStringsProvider value={STRINGS}>
        <LocaleError error={new Error("the stage exploded")} reset={vi.fn()} />
      </ChromeStringsProvider>,
    );
    expect(spy).toHaveBeenCalled();
  });

  it("renders nothing rather than English placeholders outside a locale", () => {
    // Belt and braces: the boundary always renders inside the locale layout, so
    // a null context means something is structurally wrong and a half-rendered
    // apology in the wrong language would only obscure it.
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(<LocaleError error={new Error("x")} reset={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
