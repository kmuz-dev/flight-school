/**
 * The language switch. What matters here is not the markup but the two things
 * a cadet notices: the choice survives the navigation, and it does not throw
 * them back to the hangar from wherever they were reading.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LOCALES, LOCALE_NAMES } from "@/i18n/config";
import { LocalePicker } from "@/components/ui/LocalePicker";
import { readStored } from "@/lib/storage";

const assign = vi.fn();

beforeEach(() => {
  assign.mockReset();
  // jsdom's Location is not writable; replacing the whole object is the
  // supported way to observe a navigation without performing one.
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { pathname: "/en/plane/dart/fold/", assign },
  });
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function renderPicker(locale: (typeof LOCALES)[number] = "en") {
  render(<LocalePicker locale={locale} a11yLabel="Choose a language" />);
  return screen.getByTestId("locale-picker") as HTMLSelectElement;
}

describe("the locale picker", () => {
  it("offers every locale, each named in its own language", () => {
    const select = renderPicker();
    const options = [...select.options].map((o) => o.textContent);
    expect(options).toEqual(LOCALES.map((code) => LOCALE_NAMES[code]));
  });

  it("shows the language currently being read", () => {
    expect(renderPicker("ja").value).toBe("ja");
  });

  it("is reachable and nameable by a screen reader", () => {
    renderPicker();
    expect(screen.getByLabelText("Choose a language")).toBe(screen.getByTestId("locale-picker"));
  });

  it("keeps the cadet on the same step of the same plane", () => {
    const select = renderPicker();
    fireEvent.change(select, { target: { value: "fr" } });
    expect(assign).toHaveBeenCalledWith("/fr/plane/dart/fold/");
  });

  it("remembers the choice, so the next visit opens in that language", () => {
    const select = renderPicker();
    fireEvent.change(select, { target: { value: "ar" } });
    expect(readStored().locale).toBe("ar");
  });

  it("does not disturb progress already stored", () => {
    window.localStorage.setItem(
      "flightschool.v1",
      JSON.stringify({ progress: { dart: { step: 4, updatedAt: "x" } }, completed: {} }),
    );
    fireEvent.change(renderPicker(), { target: { value: "de" } });
    expect(readStored().progress.dart?.step).toBe(4);
  });
});
