import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandMark } from "@/components/ui/BrandMark";

describe("Flight School brand mark", () => {
  it("uses the approved looping-glider asset and stays decorative beside live brand text", () => {
    const { container } = render(<BrandMark data-testid="mark" />);
    const mark = screen.getByTestId("mark");
    const image = container.querySelector("img");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(image).toHaveAttribute("alt", "");
    expect(image?.getAttribute("src")).toContain("flight-school-looping-glider");
  });

  it("lets a standalone mark carry an accessible label", () => {
    render(<BrandMark label="Flight School" data-testid="mark" />);
    expect(screen.getByTestId("mark")).toHaveAttribute("role", "img");
    expect(screen.getByTestId("mark")).toHaveAttribute("aria-label", "Flight School");
  });
});

