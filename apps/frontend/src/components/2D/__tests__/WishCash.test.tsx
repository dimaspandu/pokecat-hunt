import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import WishCash from "../WishCash";

describe("WishCash", () => {
  it("renders SVG without crashing", () => {
    render(<WishCash data-testid="wishcash" />);
    const svg = screen.getByTestId("wishcash");
    expect(svg).toBeInTheDocument();
    expect(svg.tagName).toBe("svg");
  });

  it("has correct aria-label", () => {
    render(<WishCash data-testid="wishcash" />);
    const svg = screen.getByTestId("wishcash");
    expect(svg).toHaveAttribute("aria-label", "Wish Cash");
  });

  it("applies custom props (width, height, className)", () => {
    render(<WishCash data-testid="wishcash" width={64} height={64} className="icon-wish" />);
    const svg = screen.getByTestId("wishcash");
    expect(svg).toHaveAttribute("width", "64");
    expect(svg).toHaveAttribute("height", "64");
    expect(svg).toHaveClass("icon-wish");
  });

  it("contains multiple <path> elements with proper fills", () => {
    render(<WishCash data-testid="wishcash" />);
    const svg = screen.getByTestId("wishcash");
    const paths = svg.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(5);

    // Check that some specific fills exist (e.g. brand colors)
    const fills = Array.from(paths).map((p) => p.getAttribute("fill"));
    expect(fills).toContain("#ED2601");
    expect(fills).toContain("#FE9901");
    expect(fills).toContain("#FDEA96");
  });

  it("supports custom data attributes", () => {
    render(<WishCash data-testid="wishcash" data-custom="meow" />);
    const svg = screen.getByTestId("wishcash");
    expect(svg).toHaveAttribute("data-custom", "meow");
  });
});
